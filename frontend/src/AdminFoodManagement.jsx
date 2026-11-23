
import { useEffect, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'
const MENU_API = `${API_BASE}/api/menu/`

export default function AdminFoodManagement() {
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [editingFoodId, setEditingFoodId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const [foodForm, setFoodForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    image: null,
    is_available: true,
  })

  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  const getHeaders = () => ({
    Authorization: `Token ${localStorage.getItem('dineora_admin_token')}`,
  })

  // LOAD CATEGORIES AND FOOD ITEMS
  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [categoryResponse, foodResponse] = await Promise.all([
        fetch(`${MENU_API}admin/categories/`, {
          headers: getHeaders(),
        }),
        fetch(`${MENU_API}admin/foods/`, {
          headers: getHeaders(),
        }),
      ])

      if (!categoryResponse.ok || !foodResponse.ok) {
        throw new Error('Unable to load food management data.')
      }

      const categoryData = await categoryResponse.json()
      const foodData = await foodResponse.json()

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : categoryData.results || []
      )

      setFoods(
        Array.isArray(foodData)
          ? foodData
          : foodData.results || []
      )
    } catch (err) {
      setError(err.message || 'Unable to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // CATEGORY FILTER
  const filteredFoods =
    selectedCategory === 'ALL'
      ? foods
      : foods.filter(
          (food) =>
            String(food.category) === String(selectedCategory)
        )

  // FORM INPUT
  const handleFoodInput = (event) => {
    const { name, value, type, checked, files } = event.target

    setFoodForm((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'file'
            ? files[0] || null
            : value,
    }))
  }

  // RESET FORM
  const resetFoodForm = () => {
    setEditingFoodId(null)

    setFoodForm({
      name: '',
      category: '',
      description: '',
      price: '',
      image: null,
      is_available: true,
    })

    const fileInput = document.getElementById('food-image')

    if (fileInput) {
      fileInput.value = ''
    }
  }

  // ADD OR UPDATE FOOD
  const handleFoodSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()

      formData.append('name', foodForm.name)
      formData.append('category', foodForm.category)
      formData.append('description', foodForm.description)
      formData.append('price', foodForm.price)
      formData.append('is_available', foodForm.is_available)

      if (foodForm.image) {
        formData.append('image', foodForm.image)
      }

      const url = editingFoodId
        ? `${MENU_API}admin/foods/${editingFoodId}/`
        : `${MENU_API}admin/foods/`

      const response = await fetch(url, {
        method: editingFoodId ? 'PATCH' : 'POST',
        headers: getHeaders(),
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(JSON.stringify(data))
      }

      setMessage(
        editingFoodId
          ? 'Food item updated successfully.'
          : 'Food item added successfully.'
      )

      resetFoodForm()
      setSelectedCategory('ALL')

      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to save food item.')
    } finally {
      setSaving(false)
    }
  }

  // EDIT FOOD
  const handleEdit = (food) => {
    setEditingFoodId(food.id)

    setFoodForm({
      name: food.name || '',
      category: String(food.category || ''),
      description: food.description || '',
      price: food.price || '',
      image: null,
      is_available: food.is_available,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // DELETE FOOD ITEM
  const handleDelete = async (foodId) => {
    if (!foodId || deletingId !== null) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this food item?'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(foodId)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${MENU_API}admin/foods/${foodId}/`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      )

      if (!response.ok) {
        const responseText = await response.text()

        throw new Error(
          `Delete failed (${response.status}): ${responseText || response.statusText}`
        )
      }

      // Remove deleted food from UI immediately
      setFoods((previousFoods) =>
        previousFoods.filter(
          (food) => String(food.id) !== String(foodId)
        )
      )

      if (String(editingFoodId) === String(foodId)) {
        resetFoodForm()
      }

      setMessage('Food item deleted successfully.')

      // Refresh from database
      await loadData()

    } catch (err) {
      setError(err.message || 'Unable to delete food item.')
    } finally {
      setDeletingId(null)
    }
  }

  // ENABLE OR DISABLE FOOD
  const handleAvailability = async (food) => {
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${MENU_API}admin/foods/${food.id}/availability/`,
        {
          method: 'PATCH',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_available: !food.is_available,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Availability update failed.')
      }

      setMessage('Food availability updated.')
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  // ADD CATEGORY
  const handleCategorySubmit = async (event) => {
    event.preventDefault()

    if (!categoryName.trim()) {
      setError('Please enter a category name.')
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${MENU_API}admin/categories/`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          is_active: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(JSON.stringify(data))
      }

      setCategoryName('')
      setCategoryDescription('')
      setMessage('Category added successfully.')

      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to add category.')
    }
  }

  // IMAGE URL
  const getImageUrl = (image) => {
    if (!image) return ''

    return image.startsWith('http')
      ? image
      : `${API_BASE}${image}`
  }

  if (loading) {
    return (
      <div className="admin-food-loading">
        Loading food management...
      </div>
    )
  }

  return (
    <div className="admin-food-management">

      <div className="admin-food-heading">
        <div>
          <h2>Food Management</h2>
          <p>Add, edit and manage your restaurant food items.</p>
        </div>

        <button type="button" onClick={loadData}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-food-error">{error}</div>
      )}

      {message && (
        <div className="admin-food-success">{message}</div>
      )}

      {/* FOOD FORM */}
      <section className="admin-food-form-section">
        <h3>
          {editingFoodId ? 'Edit Food Item' : 'Add New Food Item'}
        </h3>

        <form onSubmit={handleFoodSubmit} className="admin-food-form">

          <label>
            Food Name
            <input
              name="name"
              value={foodForm.name}
              onChange={handleFoodInput}
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={foodForm.category}
              onChange={handleFoodInput}
              required
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Price (₹)
            <input
              type="number"
              name="price"
              min="0.01"
              step="0.01"
              value={foodForm.price}
              onChange={handleFoodInput}
              required
            />
          </label>

          <label>
            Food Image
            <input
              id="food-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFoodInput}
            />
          </label>

          <label className="admin-food-full-width">
            Description
            <textarea
              name="description"
              value={foodForm.description}
              onChange={handleFoodInput}
              rows="3"
            />
          </label>

          <label className="admin-food-checkbox">
            <input
              type="checkbox"
              name="is_available"
              checked={foodForm.is_available}
              onChange={handleFoodInput}
            />
            Available for customers
          </label>

          <div className="admin-food-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingFoodId
                  ? 'Update Food Item'
                  : 'Add Food Item'}
            </button>

            {editingFoodId && (
              <button type="button" onClick={resetFoodForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* CATEGORY FORM */}
      <section className="admin-food-form-section">
        <h3>Add Food Category</h3>

        <form
          onSubmit={handleCategorySubmit}
          className="admin-category-form"
        >
          <input
            placeholder="Category name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            required
          />

          <input
            placeholder="Category description"
            value={categoryDescription}
            onChange={(event) =>
              setCategoryDescription(event.target.value)
            }
          />

          <button type="submit">Add Category</button>
        </form>

        <div className="admin-category-list">
          <button
            type="button"
            className={selectedCategory === 'ALL' ? 'active' : ''}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Categories
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={
                String(selectedCategory) === String(category.id)
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setSelectedCategory(String(category.id))
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* FOOD ITEMS */}
      <section className="admin-food-list-section">
        <h3>
          {selectedCategory === 'ALL'
            ? `Existing Food Items (${filteredFoods.length})`
            : `${categories.find(
                (category) =>
                  String(category.id) === String(selectedCategory)
              )?.name || 'Selected Category'} (${filteredFoods.length})`}
        </h3>

        {filteredFoods.length === 0 ? (
          <div className="admin-food-empty">
            No food items found in this category.
          </div>
        ) : (
          <div className="admin-food-list">
            {filteredFoods.map((food) => (
              <article className="admin-food-card" key={food.id}>

                {food.image ? (
                  <img src={getImageUrl(food.image)} alt={food.name} />
                ) : (
                  <div className="admin-food-no-image">
                    No Image
                  </div>
                )}

                <div className="admin-food-card-details">
                  <h4>{food.name}</h4>
                  <p>{food.category_name}</p>

                  <strong>
                    ₹{Number(food.price).toFixed(2)}
                  </strong>

                  <span className={
                    food.is_available ? 'available' : 'unavailable'
                  }>
                    {food.is_available ? 'Available' : 'Unavailable'}
                  </span>

                  <div className="admin-food-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(food)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAvailability(food)}
                    >
                      {food.is_available ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId !== null}
                      onClick={() => {
                        handleDelete(food.id)
                      }}
                    >
                      {deletingId === food.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
