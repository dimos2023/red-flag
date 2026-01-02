# Red Flag - Standalone Version

A complete, standalone web platform for fraud detection and scam reporting using pure HTML, CSS, and JavaScript.

## 📁 Files Included

### HTML Pages
- **index.html** - Home page with hero section and features
- **register.html** - User registration with email & phone verification
- **login.html** - User login page
- **report.html** - Scam report submission form
- **search.html** - Search page for checking scam reports
- **search-results.html** - Results display (Red Flag / Green Flag)
- **admin.html** - Admin dashboard for managing reports
- **privacy.html** - Privacy policy page
- **terms.html** - Terms of use page

### Style Files
- **styles.css** - Complete CSS styling with:
  - CSS variables for easy customization
  - Responsive design (mobile-first)
  - Modern color scheme (Red/Green/Blue/Yellow)
  - Animations and transitions
  - Dark mode support ready

### JavaScript File
- **script.js** - Complete functionality including:
  - User registration and authentication
  - Email and phone verification
  - Report submission
  - Search functionality
  - Admin dashboard
  - Toast notifications
  - Demo data for testing

## 🚀 How to Use

### 1. Open the Project
Simply open any of the HTML files in your web browser:
- Double-click `index.html` to start
- Or right-click → Open with → Your browser

### 2. Using VS Code
1. Open VS Code
2. File → Open Folder
3. Select the folder containing these files
4. Right-click on `index.html` → "Open with Live Server" (if you have the extension)
   OR just open the file directly in your browser

### 3. Recommended Browser Extensions for VS Code
- **Live Server** - Provides a local development server
- **Open in Browser** - Quick open HTML files

## 👥 Demo Credentials

The platform comes with demo accounts for testing:

### Regular User
- **Email:** user@test.com
- **Password:** password123
- **Phone:** +1234567890

### Admin User
- **Email:** admin@test.com
- **Password:** admin123
- **Phone:** +0987654321

## 🎯 Features

### User Features
1. **User Registration**
   - Full name, email, phone number, password
   - Email verification with 6-digit code
   - Phone OTP verification
   - Form validation

2. **Login System**
   - Secure authentication
   - Session management
   - Role-based access

3. **Report Scam**
   - Scammer phone number (required)
   - Scammer name, address, national ID (optional)
   - Photo uploads (profile, national ID)
   - Detailed description
   - File preview for images

4. **Search Functionality**
   - Search by: Phone, Name, National ID, Address
   - Red Flag (scam found)
   - Green Flag (no scam found)
   - Detailed report display

### Admin Features
1. **Dashboard**
   - Statistics (Total, Pending, Approved)
   - Report management
   - Filter by status

2. **Report Review**
   - View full report details
   - Approve or reject reports
   - Add admin notes
   - Real-time status updates

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --color-red: #dc2626;
    --color-green: #16a34a;
    --color-blue: #2563eb;
    --color-yellow: #ca8a04;
    /* ... more colors */
}
```

### Changing Content
1. Open any HTML file
2. Edit the text content
3. Save and refresh the browser

### Adding New Pages
1. Create a new `.html` file
2. Include the header and footer sections
3. Link to `styles.css` and `script.js`
4. Add your content

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px+)
- Mobile (375px+)

Features:
- Mobile navigation menu
- Responsive grids
- Touch-friendly buttons
- Optimized layouts

## 🔧 Browser Compatibility

Tested and works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 📊 Demo Data

The platform includes demo data for testing:
- 2 demo users (1 regular, 1 admin)
- 3 demo scam reports (2 approved, 1 pending)

Data is stored in:
- `localStorage` for user sessions
- `sessionStorage` for temporary registration data
- JavaScript variables for reports (reset on page refresh)

## 🔒 Security Notes

This is a **demo/prototype** version. For production:

1. Add server-side authentication
2. Use a real database (MySQL, PostgreSQL, MongoDB)
3. Implement proper password hashing (bcrypt)
4. Add SSL/TLS encryption
5. Use secure session management
6. Add rate limiting
7. Implement CSRF protection
8. Add email/SMS verification services

## 🚀 Deployment

To deploy this as a static website:

### Option 1: GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access at `https://username.github.io/repository-name`

### Option 2: Netlify
1. Drag and drop folder to Netlify
2. Instant deployment with HTTPS

### Option 3: Vercel
1. Import from Git
2. Automatic deployment

### Option 4: Traditional Hosting
1. Upload files via FTP/SFTP
2. Ensure `index.html` is in the root
3. Done!

## 🐛 Troubleshooting

### Issue: Page not loading
- **Solution:** Check browser console for errors (F12)

### Issue: Styles not applying
- **Solution:** Ensure `styles.css` is in the same folder as HTML files

### Issue: JavaScript not working
- **Solution:** Check that `script.js` is linked at the bottom of HTML files

### Issue: Demo codes not showing
- **Solution:** Check browser console (F12) - codes are logged there

## 📝 Adding Your Own Features

### Example: Adding a Contact Page
1. Create `contact.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Include header -->
    <header class="header">
        <!-- Copy from index.html -->
    </header>

    <!-- Your content -->
    <main>
        <!-- Contact form -->
    </main>

    <!-- Include footer -->
    <footer class="footer">
        <!-- Copy from index.html -->
    </footer>

    <script src="script.js"></script>
</body>
</html>
```

2. Add navigation link to header in all HTML files

## 📚 Next Steps

To turn this into a full production application:

1. **Backend Development**
   - Choose a backend framework (Node.js, PHP, Python)
   - Set up a database (MySQL, PostgreSQL, MongoDB)
   - Create API endpoints
   - Implement authentication

2. **Security**
   - Add HTTPS
   - Implement proper session management
   - Add rate limiting
   - Implement input validation
   - Add CSRF protection

3. **Testing**
   - Write unit tests
   - Perform security audits
   - Test on multiple devices
   - User acceptance testing

## 📞 Support

For questions or issues:
- Check the browser console for errors
- Review the code comments
- Test with different browsers

## 📄 License

This is a demo project for educational purposes. Feel free to use and modify as needed.

---

**Happy Coding! 🚩**
