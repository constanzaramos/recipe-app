# 🍳 Gourmetia - Recipe Search Application

A modern, responsive recipe search application built with vanilla JavaScript, HTML5, and CSS3. Discover delicious recipes from around the world with our powerful search engine.

![Gourmetia Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Valid-orange)
![CSS3](https://img.shields.io/badge/CSS3-Modern-blue)

## 🌟 Features

### 🔍 **Advanced Search Capabilities**
- **Ingredient-based search**: Find recipes by specific ingredients
- **Category filtering**: Browse by recipe categories (Beef, Chicken, Dessert, etc.)
- **Cuisine filtering**: Search by regional cuisines
- **Alphabetical search**: Quick search by recipe name starting letter
- **Combined filters**: Use multiple search criteria simultaneously

### 📱 **Responsive Design**
- **Mobile-first approach**: Optimized for all device sizes
- **Touch-friendly interface**: Perfect for mobile and tablet users
- **Adaptive layout**: Seamless experience across desktop, tablet, and mobile

### 🎨 **Modern UI/UX**
- **Elegant design**: Clean, modern interface with beautiful color palette
- **Smooth animations**: Fluid transitions and hover effects
- **Intuitive navigation**: Easy-to-use interface with clear visual hierarchy
- **Loading states**: Visual feedback during search operations

### 📄 **Recipe Details**
- **Comprehensive information**: Ingredients, instructions, cooking time, servings
- **Step-by-step instructions**: Numbered cooking steps for easy following
- **Ingredient lists**: Detailed measurements and preparation notes
- **Recipe images**: High-quality food photography

### 🔢 **Pagination System**
- **Efficient browsing**: 10 recipes per page for optimal performance
- **Navigation controls**: Easy page navigation with numbered buttons
- **Results counter**: Shows current page and total results

## 🚀 Live Demo

**🌐 [View Live Demo](https://gourmetia-recipe-app.netlify.app/)**

*Experience the full functionality of Gourmetia with our live demo!*

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **APIs**: TheMealDB API (Public & Premium endpoints)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **Design**: Custom CSS with modern design principles

## 📋 Prerequisites

Before running this project, make sure you have:

- **Web Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Local Server**: For development (optional but recommended)
- **Internet Connection**: Required for API calls and external resources

## 🚀 Installation & Setup

### Option 1: Direct File Opening
1. **Clone or download** the project files
2. **Open** `index.html` in your web browser
3. **Start using** the application immediately

### Option 2: Local Development Server (Recommended)

#### Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server -p 8000
```

#### Using Live Server (VS Code Extension):
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Using PHP:
```bash
php -S localhost:8000
```

## 📁 Project Structure

```
recipe-app/
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── app.js             # JavaScript functionality
├── README.md          # Project documentation
└── recipes.jpg        # Background image (if available)
```

## 🎯 How to Use

### 1. **Search by Ingredients**
- Type ingredients in the search bar (e.g., "chicken, garlic, onion")
- Click the search button or press Enter
- Browse through matching recipes

### 2. **Filter by Category**
- Select a category from the dropdown menu
- Click the "Search" button
- View recipes in that category

### 3. **Filter by Cuisine**
- Choose a cuisine type from the dropdown
- Click "Search" to find regional recipes

### 4. **Quick Alphabetical Search**
- Click any letter button (A-Z)
- Instantly see recipes starting with that letter

### 5. **Browse Popular Categories**
- Scroll to the "Popular Categories" section
- Click on any category card
- Explore featured recipes

### 6. **View Recipe Details**
- Click on any recipe card
- View detailed ingredients and step-by-step instructions
- See cooking time, servings, and other details

## 🔧 Configuration

### API Configuration
The application uses TheMealDB API. You can modify the API configuration in `app.js`:

```javascript
const CONFIG = {
    API_KEY: "your-api-key",           // Your API key
    API_PREMIUM_URL: "premium-url",    // Premium API endpoint
    API_PUBLIC_URL: "public-url",      // Public API endpoint
    ITEMS_PER_PAGE: 10,               // Results per page
    MAX_VISIBLE_PAGES: 5              // Pagination display
};
```

### Customization
- **Colors**: Modify the color palette in `style.css`
- **Fonts**: Change fonts in the CSS variables
- **Layout**: Adjust responsive breakpoints as needed

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## 🎨 Design Features

### Color Palette
- **Primary Green**: #3A5B26 (Forest Green)
- **Accent Orange**: #E17E06 (Vibrant Orange)
- **Secondary Yellow**: #F2E074 (Soft Yellow)
- **Light Olive**: #D0D59D (Muted Green)
- **Background**: #F1FDFB (Light Blue-Green)

### Typography
- **Headings**: Playfair Display (Serif)
- **Body Text**: Inter (Sans-serif)
- **Icons**: Font Awesome 6.4.0

## 🔍 API Integration

The application integrates with TheMealDB API providing:
- **Recipe search** by ingredients, categories, and cuisines
- **Detailed recipe information** including ingredients and instructions
- **High-quality recipe images**
- **Fallback mechanisms** for API reliability

## 🚀 Performance Features

- **Lazy loading** of recipe details
- **Efficient pagination** for large result sets
- **Optimized API calls** with fallback mechanisms
- **Responsive images** for fast loading
- **Minimal dependencies** for faster performance

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TheMealDB** for providing the recipe API
- **Font Awesome** for the beautiful icons
- **Google Fonts** for the typography
- **Open Source Community** for inspiration and support

## 📞 Support

If you have any questions or need support:

- **Issues**: Create an issue in the repository
- **Email**: [your-email@example.com]
- **Documentation**: Check the inline code comments

---

**Made with ❤️ by [Your Name]**

*Enjoy cooking with Gourmetia! 🍽️*
