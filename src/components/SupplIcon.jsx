export default function SupplIcon({ emoji, imageUrl, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.55 }
  if (imageUrl) {
    return (
      <span className="suppl-icon" style={style}>
        <img src={imageUrl} alt="" />
      </span>
    )
  }
  return (
    <span className="suppl-icon" style={style}>
      {emoji || '💊'}
    </span>
  )
}
