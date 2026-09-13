export default function Rating({ count = 5, reviews }) {
  return <span className="rating"><span>{'★'.repeat(count)}</span>{reviews && <small>({reviews})</small>}</span>
}
