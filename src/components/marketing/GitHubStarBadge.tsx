import { cva } from 'class-variance-authority'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GitHubMark } from '@/components/common/GitHubMark'

interface GitHubStarBadgeProps {
  stars?: number
}

const badgePartVariants = cva('inline-flex min-w-0 items-center justify-center', {
  variants: {
    part: {
      label: 'h-full gap-1.5 px-2 sm:px-3',
      count: 'h-full gap-1.5 border-s border-primary/20 bg-primary/10 px-2 sm:px-2.5 text-foreground tabular-nums [&_svg]:text-primary',
    },
  },
})

/** The label renders without a count while repository data is unavailable. */
export function GitHubStarBadge({ stars }: GitHubStarBadgeProps) {
  const starCount = typeof stars === 'number' && Number.isSafeInteger(stars) && stars >= 0 ? stars : undefined
  const count = starCount === undefined ? undefined : new Intl.NumberFormat('en', {
    notation: 'compact', maximumFractionDigits: 1,
  }).format(starCount)
  const accessibleLabel = [
    'Star this repository on GitHub',
    starCount === undefined ? undefined : `${new Intl.NumberFormat('en').format(starCount)} ${starCount === 1 ? 'star' : 'stars'}`,
    'opens in a new tab',
  ].filter(Boolean).join(', ')

  return (
    <a
      href="https://github.com/Fechin/ssh-key-generator"
      target="_blank"
      rel="noopener noreferrer"
      lang="en"
      dir="ltr"
      aria-label={accessibleLabel}
      data-slot="github-star-badge"
      className="group inline-flex min-h-11 min-w-11 max-w-full items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Badge variant="star" size="action">
        <span className={badgePartVariants({ part: 'label' })}>
          <GitHubMark />
          <span className="hidden sm:inline">Star on GitHub</span>
        </span>
        {count !== undefined && (
          <span className={badgePartVariants({ part: 'count' })}>
            <Star aria-hidden="true" />
            <span>{count}</span>
          </span>
        )}
      </Badge>
    </a>
  )
}
