import { Hero } from '@/components/home/Hero'
import { ResearchBento } from '@/components/home/ResearchBento'
import { NewsAndPubsTeaser } from '@/components/home/NewsAndPubsTeaser'
import { CTAJoin } from '@/components/home/CTAJoin'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ResearchBento />
      <NewsAndPubsTeaser />
      <CTAJoin />
    </>
  )
}
