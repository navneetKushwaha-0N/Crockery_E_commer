import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { money } from '../../utils/formatters'
import Rating from './Rating'

export default function ProductCard({ product }) {
  const { add, wish, toggleWish } = useStore()

  const liked = wish.includes(product.id)

  return (
    <>
      <style>{`
        .product-card .add-hover-cart {
          position: relative;
          width: 42px;
          height: 42px;
          padding: 0;
          border: 1px solid rgba(32, 39, 34, 0.18);
          border-radius: 50%;
          background: #17241d;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
          white-space: nowrap;
          cursor: pointer;

          transition:
            width 0.48s cubic-bezier(.22, 1, .36, 1),
            border-radius 0.48s cubic-bezier(.22, 1, .36, 1),
            background 0.3s ease,
            box-shadow 0.3s ease,
            transform 0.3s ease;
        }

        .product-card .add-hover-cart .add-cart-icon {
          width: 17px;
          height: 17px;
          flex: 0 0 auto;
          transition:
            transform 0.48s cubic-bezier(.22, 1, .36, 1);
        }

        .product-card .add-hover-cart .add-cart-text {
          max-width: 0;
          opacity: 0;
          transform: translateX(8px);
          overflow: hidden;

          font-size: 12px;
          font-weight: 600;
          letter-spacing: .15px;

          transition:
            max-width 0.48s cubic-bezier(.22, 1, .36, 1),
            opacity 0.25s ease,
            transform 0.48s cubic-bezier(.22, 1, .36, 1);
        }

        .product-card .add-hover-cart:hover {
          width: 142px;
          border-radius: 24px;
          background: #2f7048;
          box-shadow: 0 10px 28px rgba(47, 112, 72, .20);
          transform: translateY(-2px);
        }

        .product-card .add-hover-cart:hover .add-cart-icon {
          transform: translateX(-2px) rotate(-6deg);
        }

        .product-card .add-hover-cart:hover .add-cart-text {
          max-width: 90px;
          opacity: 1;
          transform: translateX(0);
        }

        .product-card .add-hover-cart:active {
          transform: translateY(0) scale(.96);
        }

        .product-card .add-hover-cart:focus-visible {
          outline: 2px solid #2f7048;
          outline-offset: 3px;
        }

        @media (max-width: 700px) {
          .product-card .add-hover-cart {
            width: 142px;
            border-radius: 24px;
          }

          .product-card .add-hover-cart .add-cart-text {
            max-width: 90px;
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-card .add-hover-cart,
          .product-card .add-hover-cart .add-cart-icon,
          .product-card .add-hover-cart .add-cart-text {
            transition: none !important;
          }
        }
      `}</style>

      <article className="product-card">
        {/* Product Image */}
        <div className="product-image">
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image}
              alt={product.name}
            />
          </Link>

          <span className="tag">
            {product.tag}
          </span>

          <button
            type="button"
            className={`heart ${liked ? 'liked' : ''}`}
            onClick={() => toggleWish(product.id)}
            aria-label={
              liked
                ? 'Remove from wishlist'
                : 'Add to wishlist'
            }
          >
            <Heart
              size={17}
              fill={liked ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Product Details */}
        <div className="product-copy">
          <Link to={`/product/${product.id}`}>
            <h3>{product.name}</h3>
          </Link>

          <p>{product.category}</p>

          {/* Product Rating & Reviews */}
          <Rating
            rating={product.rating}
            reviews={product.reviewCount}
          />

          {/* Price */}
          <div className="price">
            <strong>
              {money(product.price)}
            </strong>

            {product.old != null && (
              <del>
                {money(product.old)}
              </del>
            )}
          </div>

          {/* Premium Add to Cart */}
          <button
            type="button"
            className="add add-hover-cart"
            onClick={() => add(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag
              className="add-cart-icon"
              size={17}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span className="add-cart-text">
              Add to cart
            </span>
          </button>
        </div>
      </article>
    </>
  )
}
