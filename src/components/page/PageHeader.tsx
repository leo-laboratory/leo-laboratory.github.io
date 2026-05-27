'use client'

interface PageHeaderProps {
  title: string
  intro?: string
}

export function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
      <h1
        className="font-serif font-medium tracking-tight mb-4"
        style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
        }}
      >
        {title}
      </h1>
      {intro && (
        <p className="text-base max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {intro}
        </p>
      )}
    </header>
  )
}
