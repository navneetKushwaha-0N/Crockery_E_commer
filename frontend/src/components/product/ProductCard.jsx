import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { money } from '../../utils/formatters'
import Rating from './Rating'

export default function ProductCard({ product }) {
  const { add, wish, toggleWish } = useStore()
  const liked = wish.includes(product.id)
  return <article className="product-card"><div className="product-image"><Link to={`/product/${product.id}`}><img src={product.image} alt={product.name}/></Link><span className="tag">{product.tag}</span><button className={`heart ${liked ? 'liked' : ''}`} onClick={() => toggleWish(product.id)} aria-label="Add to wishlist"><Heart size={17} fill={liked ? 'currentColor' : 'none'}/></button></div><div className="product-copy"><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><p>{product.category}</p><Rating count={product.rating} reviews={product.reviews}/><div className="price"><strong>{money(product.price)}</strong><del>{money(product.old)}</del></div><button className="add" onClick={() => add(product)}>Add to cart</button></div></article>
}
