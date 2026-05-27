'use client'

import { TAG_VOCAB } from '@/lib/data/types'
import type { Tag } from '@/lib/data/types'
import { useTranslation } from '@/lib/i18n'

interface TagFilterBarProps {
  active: Tag | null
  onChange: (tag: Tag | null) => void
}

export function TagFilterBar({ active, onChange }: TagFilterBarProps) {
  const { t } = useTranslation()
  return (
    <div
      className="flex flex-wrap gap-2 mb-8"
      role="tablist"
      aria-label="Filter publications by topic"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === null}
        onClick={() => onChange(null)}
        className="px-3 py-1 rounded-full text-xs transition-colors"
        style={{
          background: active === null ? 'var(--accent)' : 'transparent',
          color: active === null ? '#fbf7ec' : 'var(--text-secondary)',
          border: `1px solid ${active === null ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        {t('pubs.tag.all')}
      </button>
      {TAG_VOCAB.map(tag => {
        const isActive = active === tag
        return (
          <button
            key={tag}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tag)}
            className="px-3 py-1 rounded-full text-xs transition-colors"
            style={{
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fbf7ec' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {t(`pubs.tag.${tag}`)}
          </button>
        )
      })}
    </div>
  )
}
