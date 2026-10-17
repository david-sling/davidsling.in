# Videos

Remotion compositions for social clips of the site. Separate package so the site build never pulls in Remotion.

- `EquanimStory`: 1080×1920 Instagram story of the Equanim playground. The finger path, slider values and pendulum sim are precomputed in `src/timeline.ts` (same RK4 and equations as `src/components/pendulum.tsx`); edit the `drag(...)` calls to change the choreography.

```bash
npm install
npm run studio   # preview
npm run render   # out/equanim-story.mp4
```

Fonts come from the site's `public/fonts`.
