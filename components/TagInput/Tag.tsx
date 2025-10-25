interface TagProps {
  name: string;
  color?: string;
  onRemove?: (name: string) => void;
}

export const Tag = ({ name, color, onRemove }: TagProps) => {
  return (
    <span
      key={name}
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color || '#6B7280' }}
    >
      {name}
      {onRemove && (<button
        type="button"
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        onClick={() => onRemove(name)}
      >
        &times;
      </button>)}
    </span>
  )
}