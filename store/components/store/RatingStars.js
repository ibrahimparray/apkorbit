export default function RatingStars({ rating = 0, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  const containerClass = size === 'lg' ? 'gap-0.5' : 'gap-0.5'

  return (
    <div className={`flex items-center ${containerClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? 'text-amber-400'
              : 'text-surface-200 dark:text-surface-700'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
      ))}
      {rating > 0 && (
        <span className={`ml-1 font-semibold ${size === 'lg' ? 'text-sm' : 'text-[10px]'} text-surface-500 dark:text-surface-400`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
