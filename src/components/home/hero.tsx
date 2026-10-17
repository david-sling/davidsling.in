import { Button } from '@/components/button'
import { FlowButton } from '@/components/flow-button'
import { WordsStagger } from '@/components/words-stagger'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative mx-auto max-w-[1240px] px-4 pt-4 sm:px-6"
    >
      <div className="relative flex flex-col items-center overflow-hidden rounded-[40px] bg-sheet px-6 pb-14 pt-14 text-center shadow-[0_1px_0_oklch(1_0_0/0.7)_inset] sm:pb-14 sm:pt-16">
        <Portrait />

        <h1
          id="hero-title"
          className="mt-8 max-w-[15ch] text-[clamp(2.6rem,min(6.4vw,8.6vh),5.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
        >
          <WordsStagger text="Engineer with a designer’s eye." delay={0.15} />
        </h1>
        <p className="mt-5 max-w-[34ch] text-[clamp(1.15rem,1.8vw,1.45rem)] font-medium leading-snug tracking-[-0.01em] text-ink-3">
          I build real products with AI agents, and sweat the details they miss.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <a href="#work">See the work</a>
          </Button>
          <FlowButton asChild>
            <a href="#writing">Read the writing</a>
          </FlowButton>
        </div>

      </div>
    </section>
  )
}

function Portrait() {
  return (
    <div className="relative h-[228px] w-[176px]">
      {/*
        The disc is a backdrop; the cut-out is a real alpha matte that rises
        above it. The mask is open above the disc's lower curve (so head and
        elbows can break out sideways) and follows the circle below it.
      */}
      <div
        className="absolute bottom-0 left-1/2 h-[228px] w-[380px] -translate-x-1/2"
        style={{
          maskImage:
            'linear-gradient(#000, #000), radial-gradient(circle 88px at 50% calc(100% - 88px), #000 calc(100% - 0.5px), transparent 100%)',
          maskSize: '100% calc(100% - 24px), 100% 100%',
          maskPosition: 'top, center',
          maskRepeat: 'no-repeat',
        }}
      >
        <div aria-hidden className="absolute bottom-0 left-1/2 size-[176px] -translate-x-1/2 rounded-full bg-blue" />
        <img
          src="/media/me/portrait-sm.webp"
          srcSet="/media/me/portrait-sm.webp 420w, /media/me/portrait.webp 800w"
          sizes="250px"
          alt="David Sling laughing, hands on hips, in a white shirt"
          width={420}
          height={539}
          fetchPriority="high"
          className="absolute bottom-[-10px] left-1/2 w-[188px] max-w-none -translate-x-1/2 [transform:scale(1.3)_translate(11px,34px)]"
        />
      </div>
      <span
        data-motion="travel"
        className="absolute -right-[74px] top-[34px] inline-block text-[0.8rem] sm:-right-[118px] sm:top-[58px] sm:text-[0.88rem] cursor-default select-none rounded-full bg-ink px-3.5 py-1.5 font-semibold text-sheet sm:px-4 sm:py-2 shadow-[0_10px_20px_-10px_oklch(0.21_0.014_245/0.6)] [--tilt:-7deg] [transform:rotate(var(--tilt))] hover:animate-[sticker-wobble_0.6s_var(--ease-out)]"
      >
        Hi, I’m David
      </span>
    </div>
  )
}
