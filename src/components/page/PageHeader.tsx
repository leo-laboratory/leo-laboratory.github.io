'use client'

interface PageHeaderProps {
  title: string
  intro?: string
}

export function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>
      {intro && (
        <p className="text-lg max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
          {intro}
        </p>
      )}
      <div className="w-16 h-1 mt-6 rounded-full" style={{ background: 'var(--accent)' }} />
    </header>
  )
}
