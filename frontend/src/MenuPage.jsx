
import { useEffect, useState } from 'react'
import { useCart } from './CartContext'
import './MenuPage.css'

const API_BASE = 'http://127.0.0.1:8000'

function MenuPage() {
    const [foods, setFoods] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const { addToCart } = useCart()

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true)
                setError('')

                const [foodResponse, categoryResponse] = await Promise.all([
                    fetch(`${API_BASE}/api/menu/foods/`),
                    fetch(`${API_BASE}/api/menu/categories/`)
                ])

                if (!foodResponse.ok || !categoryResponse.ok) {
                    throw new Error('Unable to load menu.')
                }

                const foodData = await foodResponse.json()
                const categoryData = await categoryResponse.json()

                setFoods(Array.isArray(foodData) ? foodData : foodData.results || [])
                setCategories(
                    Array.isArray(categoryData)
                        ? categoryData
                        : categoryData.results || []
                )
            } catch (err) {
                setError(err.message || 'Something went wrong.')
            } finally {
                setLoading(false)
            }
        }

        fetchMenu()
    }, [])

    const filteredFoods = foods.filter((food) => {
        const matchesCategory =
            selectedCategory === 'ALL' ||
            String(food.category) === String(selectedCategory)

        const matchesSearch =
            food.name.toLowerCase().includes(search.toLowerCase())

        return matchesCategory && matchesSearch && food.is_available
    })

    const getImageUrl = (image) => {
        if (!image) return ''
        return image.startsWith('http') ? image : `${API_BASE}${image}`
    }

    return (
        <div className="menu-page">
            <section className="menu-heading">
                <span>DISCOVER OUR TASTE</span>
                <h1>Our Delicious Menu</h1>
                <p>Fresh ingredients. Authentic flavours. Made with love.</p>
            </section>

            <div className="menu-controls">
                <input
                    type="text"
                    placeholder="Search your favourite food..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="menu-categories">
                    <button
                        className={selectedCategory === 'ALL' ? 'active' : ''}
                        onClick={() => setSelectedCategory('ALL')}
                    >
                        All Items
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={
                                String(selectedCategory) === String(category.id)
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="menu-message">Loading menu...</p>}

            {error && <p className="menu-error">{error}</p>}

            {!loading && !error && (
                <div className="food-grid">
                    {filteredFoods.map((food) => (
                        <div className="food-card" key={food.id}>
                            {food.image ? (
                                <img
                                    src={getImageUrl(food.image)}
                                    alt={food.name}
                                    className="food-image"
                                />
                            ) : (
                                <div className="food-no-image">
                                    Image Coming Soon
                                </div>
                            )}

                            <div className="food-details">
                                <span className="food-category">
                                    {food.category_name}
                                </span>

                                <h3>{food.name}</h3>
                                <p>{food.description}</p>

                                <div className="food-bottom">
                                    <strong>₹{food.price}</strong>

                                    <button
                                        onClick={() => addToCart(food)}
                                    >
                                        + Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && filteredFoods.length === 0 && (
                <p className="menu-message">No food items found.</p>
            )}
        </div>
    )
}

export default MenuPage
