---
title: "I Vibecoded a Full Stack App. Here's How it Went."
date: 2026-03-23
summary: "Building offlyn.love with AI: SQL as the API, Three.js to raw WebGL, and the rules I wish I had started with."
tags: [vibecoding, ai, sql, webgl]
---

Currently I'm building a full stack dating app almost entirely using AI.

---

## The Assumption I Started With

My mental model of vibecoding was: AI does what I would have done, just faster. So I pointed it at familiar patterns: Edge Functions, a REST-ish API structure, the stuff I reach for naturally.

That assumption was wrong. And realising that was the most valuable part of the whole experience.

---

## The Architectural Shift: SQL as the API

A few days in I noticed something. AI was writing SQL fluently, more fluently than I can. Every time I asked for a query, it came back clean, well-structured, properly indexed. Until then, I was routing everything through Supabase Edge Functions.

So I asked myself: Supabase Postgres already has RLS and `auth.uid()` to ensure security. I can just write Postgres Functions. Why am I adding an extra network hop?

Here's the concrete moment it clicked. I had this endpoint to fetch a user's friends:

```typescript
export const getFriends = async (req: Request, res: Response) => {
  // First DB call, get friendships
  const { data: friendships } = await req.supabase
    .from("friendships")
    .select("id, user_id, friend_id, created_at")
    .or(`user_id.eq.${req.user.id},friend_id.eq.${req.user.id}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  const friendIds = friendships.map((f) =>
    f.user_id === req.user.id ? f.friend_id : f.user_id,
  );

  // Second DB call, get profiles
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", friendIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

  const friends = friendships.map((f) => {
    const friendId = f.user_id === req.user.id ? f.friend_id : f.user_id;
    return {
      friendship_id: f.id,
      since: f.created_at,
      ...profileMap.get(friendId),
    };
  });

  res.json({ friends });
};
```

Its not anything complicated. But it has two database round trips. Manual ID mapping in JavaScript. An admin client because the regular client couldn't do the join safely.

The Postgres version:

```sql
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    f.id          AS friendship_id,
    f.created_at  AS since,
    p.id,
    p.name,
    p.phone,
    p.avatar_url,
    p.photos
  FROM friendships f
  JOIN profiles p ON p.id = CASE
    WHEN f.user_id = v_user_id THEN f.friend_id
    ELSE f.user_id
  END
  WHERE (f.user_id = v_user_id OR f.friend_id = v_user_id)
    AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
```

One query. No admin client. Auth handled by the database. More fields returned. Called from the app as a single RPC: `supabase.rpc('get_friends')`.

Same outcome. Meaningfully better. And I wouldn't have reached for it on instinct (I'm sure there are great developers that do), it felt like more effort to me. AI wrote SQL well enough that the effort disappeared.

> **The insight:** when the tool is fluent in something you're not, the architecture should follow the tool's strengths, not your habits.

---

## Where It Goes Further: Atomicity

The friends example is simple. Two queries collapsed into one. But the real argument for Postgres RPC shows up when you need multiple things to happen together or not at all.

The swipe function does five things every time a user swipes:

1. Record the swipe
2. Remove the candidate from the cached feed
3. Check for a mutual match
4. If matched: fetch the matched profile and create a conversation
5. Return everything the app needs in one response

```sql
-- Simplified version of record_swipe()
INSERT INTO swipes (user_id, target_id, direction)
VALUES (v_user_id, p_target_id, p_direction)
ON CONFLICT (user_id, target_id)
DO UPDATE SET direction = EXCLUDED.direction;

DELETE FROM feed_cache
WHERE user_id = v_user_id AND candidate_id = p_target_id;

-- Check mutual match
IF p_direction = 'like' THEN
  SELECT EXISTS (
    SELECT 1 FROM swipes s
    WHERE s.user_id = p_target_id AND s.target_id = v_user_id AND s.direction = 'like'
  ) INTO v_matched;
END IF;

-- If matched, create conversation and carry over mutual friend
IF v_matched THEN
  INSERT INTO conversations (user_a, user_b, mutual_friend_id, is_match)
  VALUES (
    LEAST(v_user_id, p_target_id),
    GREATEST(v_user_id, p_target_id),
    v_mutual_friend_id,
    true
  )
  ON CONFLICT (user_a, user_b) DO UPDATE SET is_match = true
  RETURNING id INTO v_conversation_id;
END IF;

RETURN jsonb_build_object(
  'matched',         v_matched,
  'conversation_id', v_conversation_id,
  'remaining_count', v_remaining,
  'matched_profile', ...
);
```

If I'd built this in Express I'd have 4-5 sequential HTTP calls with no transaction wrapping them. A failure halfway through leaves the database in a broken state, swipe recorded, but no conversation created. With an RPC it either all commits or none of it does.

When I added blocking later, I dropped a block guard at the top of the same function. The block check, swipe, cache delete, match check, and conversation creation still all happen atomically. New feature, one place to update, no new failure modes.

---

## The Same Pattern, On the Frontend

The SQL realisation was about the backend. But the same thing happened when I was building the [landing page](https://offlyn.love).

I needed one 3D element in the hero section. Like any sane person, I reached for Three.js, it's the obvious choice, it's what everyone uses, and I wasn't going to write raw WebGL for a marketing page.

Then I asked AI to rewrite it without Three.js. Here's what the two versions looked like:

```javascript
// Three.js version, ~497kb imported to render one shape
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(width, height);

const geometry = new THREE.IcosahedronGeometry(1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

camera.position.z = 3;

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.003;
  mesh.rotation.y += 0.005;
  renderer.render(scene, camera);
}
animate();
```

```javascript
// Raw WebGL version, no import, ~6kb total
const gl = canvas.getContext("webgl");

const vertSrc = `
  attribute vec3 position;
  uniform mat4 uMVP;
  void main() { gl_Position = uMVP * vec4(position, 1.0); }
`;
const fragSrc = `
  precision mediump float;
  void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }
`;

// compile shaders, link program
const program = createProgram(gl, vertSrc, fragSrc);

// build icosahedron vertices manually, upload to GPU
const { vertices, indices } = buildIcosahedron(1, 1);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

function draw(t) {
  requestAnimationFrame(draw);
  const mvp = computeMVP(t); // rotate + project
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMVP"), false, mvp);
  gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
}
draw(0);
```

497kb down to 6kb. For one element on a landing page, where first load time is the only thing that matters, that's not a minor win.

I always reach for Three.js because it's easier to write. That's the whole reason abstractions exist. But with AI, the speed difference disappears, both versions take roughly the same time to produce. What you're left comparing is just the output. And on that comparison, 6kb beats 497kb every time.

> **The same insight, repeated:** when AI removes the friction of writing the lower-level thing, you stop defaulting to the abstraction.

---

## The Planning Phase: Where AI Gets It Wrong

I spent more tokens during planning than during the entire build. That was the right call, but it required understanding where AI's judgment breaks down.

My workflow settled into this:

1. Explain the product to AI
2. Refine the user journey in conversation
3. AI generates a schema
4. I tune the schema
5. Build begins

Step 4 is not optional. AI schema design is almost always bad, not wrong exactly, but locally optimised. It designs for the feature in front of it, not the system it has to live inside.

Concrete example. I needed users to be able to send a friend request to someone not on the platform yet, using just a phone number. AI's suggestion:

```sql
-- AI's suggestion: a separate table
CREATE TABLE pending_invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid REFERENCES profiles(id),
  phone       text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
```

A separate table means two sources of truth for friend relationships. When the invited user signs up you need reconciliation logic, find their pending invites, convert them to real friendships, clean up the old table. Every place in the app that renders friend status now has to query two tables.

What I went with:

```sql
-- Add one field to the existing friendships table
ALTER TABLE friendships ADD COLUMN invited_phone text;
```

When `friend_id` is null and `invited_phone` is set, it's a pending invite to a non-user. When they sign up: one `UPDATE` to set `friend_id` and clear `invited_phone`. Single source of truth. No reconciliation. No schema sprawl.

AI designed for today's feature. I designed for the table that has to coexist with everything else for the next year.

---

## The Mistakes: What I Got Wrong

These are the things I would have done automatically if I were writing the code myself. With AI in the loop, I didn't think about them. That's the pattern worth understanding.

### No Config

I didn't tell AI to use a centralised color system. So it didn't. Every screen hardcoded its own values, `#FF6B9F` scattered across 30 files, each written fresh.

When I eventually went back to pull colors into a theme config, it wasn't technically hard. The scale of it was. Touching every file, verifying nothing broke, re-testing screens. It cost a significant chunk of tokens and time that could have been avoided with one instruction at the start: _always import colors from `theme.ts`, never hardcode them._

### No Service Layer

I was building frontend first, planning to wire up the backend later. I didn't tell AI to keep all data fetching in a dedicated service folder. So it didn't. Data logic ended up scattered across components with json files being imported everywhere.

When it came time to clean up, unpicking that was painful. The service abstraction I would have reached for automatically on day one became a refactor on day 7.

---

Both of these mistakes share the same root cause. When you write code yourself, good habits are automatic, you naturally reach for a service layer, a config file, consistent patterns, because you've felt the pain of not doing it before. With AI you shift into reviewer mode. You evaluate individual outputs rather than thinking about the whole system. Each screen looks fine. The codebase doesn't.

> **Vibecoding doesn't remove the need for upfront architectural decisions. It makes it very easy to skip them without immediate consequences.** The consequences show up later, in bulk.

---

## The Rules I Developed Mid-Build

These came from things going wrong. Each one has a reason behind it.

**One thing at a time, with your confirmation in the loop.** AI will gold-plate if you don't scope it. Ask for a button and it'll refactor the screen. Confirm each step before the next one starts.

**Save all migration files locally.** Supabase branches help, but your local record is your safety net. Never let the AI apply a migration without it being saved somewhere you control.

**Commit every time something isn't breaking.** Recovery is cheap when you do this. Catastrophic when you don't. I treated every green state as a checkpoint.

**Don't ask AI to make very small changes.** The blast radius is disproportionate to the request. For surgical edits, renaming a variable, tweaking a style, it's faster and safer to do it yourself.

**Verify security manually.** RLS policies, auth checks, what fields are exposed to the client. AI doesn't think adversarially. You have to.

---

## Where It Genuinely Excels

UI came out well, consistent, clean, fast to produce. With good context it maintained the design system better than I expected. React Native component work is where AI earns its keep most visibly.

API integrations are straightforward. Boilerplate-heavy, pattern-driven work that AI handles cleanly without needing much direction.

SQL is the standout. It writes queries you'd avoid because of the effort. That changes what architecture you're willing to reach for. That's the thing I didn't expect and wouldn't have predicted.

---

## Would I Do It Again?

Yes. For side projects.

The honest caveat: vibecoding rewards preparation. The more engineering thinking you put in before the first prompt, the better everything goes. Conventions, data flow, folder structure, design tokens, decide these before you start. AI won't remind you to.

If you're junior: the danger is you won't know what conventions you're skipping. The code will work. The codebase will suffer. The pain shows up when you try to extend it.

If you're experienced: your instincts are your most valuable input. Use them before you start, not after things go wrong. The planning phase is still your job, arguably more important now, because mistakes there get built out very quickly.

The best thing vibecoding did for me wasn't write code faster. It was lead me to an architecture I wouldn't have reached for myself, because the friction of writing it had disappeared. That's a genuinely different kind of value.

---

_[offlyn.love](https://offlyn.love) is a friend-referral dating app I'm building as a side project. If you're curious about the tech: React Native + Expo, Supabase (Postgres + Auth + Storage), no traditional backend._
