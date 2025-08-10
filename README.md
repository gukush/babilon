# Simple Magazine Website - Setup & Content Management Guide

## 📁 File Structure
```
magazine-website/
├── index.html          (main website file)
├── content.json        (easy content editing)
├── images/            (folder for photos)
│   ├── authors/       (author photos)
│   └── articles/      (article images)
└── README.md          (this guide)
```

# Simple Magazine Website - Setup & Content Management Guide

## 📁 File Structure
```
magazine-website/
├── index.html          (main website file)
├── content.json        (easy content editing)
├── images/            (folder for photos)
│   ├── authors/       (author photos)
│   └── articles/      (article images)
│       ├── fiction1.jpg        (teaser image)
│       ├── fiction1-main.jpg   (main article image)
│       ├── fiction1-2.jpg      (secondary teaser image)
│       ├── realia1.jpg
│       ├── poetry1.jpg
│       └── ... (more images)
└── README.md          (this guide)
```

## 🚀 GitHub Pages Hosting (Recommended)

### Step 1: Create GitHub Account
1. Go to [github.com](https://github.com)
2. Sign up for free account
3. Verify your email

### Step 2: Create Repository
1. Click "New repository" (green button)
2. **Repository name**: `magazine-website` (or any name you want)
3. Set to **Public** (required for free GitHub Pages)
4. Check "Add README file"
5. Click "Create repository"

### Step 3: Upload Your Files
**Method A - Web Interface (Easiest):**
1. Click "uploading an existing file"
2. Drag your `index.html` file to the upload area
3. Scroll down, add commit message: "Add magazine website"
4. Click "Commit changes"
5. Repeat for all files/folders

**Method B - GitHub Desktop:**
1. Download GitHub Desktop app
2. Clone your repository
3. Copy files into local folder
4. Commit and push changes

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab (top of page)
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source", select **Deploy from a branch**
5. Select **main** branch
6. Click **Save**

### Step 5: Get Your URL
- After 2-3 minutes, your site will be available at:
- `https://yourusername.github.io/magazine-website`
- GitHub will show the URL in the Pages settings

### Step 6: Custom Domain (Optional)
- Buy a domain (like `yourmagazine.com`)
- Add CNAME file with your domain
- Update DNS settings
- Enable HTTPS in GitHub Pages settings

## 🖼️ Adding Images to Replace "GRAFIKA (DO TEKSTU)"

### Image File Organization:
```
images/
├── articles/
│   ├── fiction1.jpg         (teaser image for Fikcja page)
│   ├── fiction1-main.jpg    (main image for article page)
│   ├── fiction1-2.jpg       (secondary teaser image)
│   ├── fiction2.jpg
│   ├── fiction2-main.jpg
│   ├── realia1.jpg
│   ├── realia1-main.jpg
│   ├── poetry1.jpg
│   ├── poetry1-main.jpg
│   └── ...
└── authors/
    ├── author1.jpg
    ├── author2.jpg
    └── ...
```

### Image Specifications:
- **Teaser images**: 400x200px (landscape)
- **Main article images**: 600x300px (landscape)
- **Author photos**: 150x150px (square)
- **Format**: JPG or PNG
- **File size**: Under 500KB each

### How Images Are Added:

**1. For Teaser Images (Category Pages):**
The HTML already includes `data-image` attributes:
```html
<div class="teaser-label" data-image="images/articles/fiction1.jpg">GRAFIKA (DO TEKSTU)</div>
```

**2. For Main Article Images:**
Each article in the `articles` object has a `mainImage` property:
```javascript
'fiction1': {
    title: 'Zagubiona w czasie',
    content: 'Article content...',
    mainImage: 'images/articles/fiction1-main.jpg'
}
```

**3. Image Loading Process:**
- Website automatically tries to load images from specified paths
- If image exists → displays image with text overlay
- If image missing → shows colored background with text
- No broken image icons - graceful fallback

### Adding New Images:

**Step 1: Prepare Images**
1. Resize to correct dimensions
2. Optimize file size (use online compressors)
3. Name descriptively: `fiction-story-title.jpg`

**Step 2: Upload to GitHub**
1. Go to your repository
2. Click `images/articles/` folder
3. Click "Add file" → "Upload files"
4. Drag images to upload area
5. Commit changes

**Step 3: Update Content**
Edit the HTML file and update image paths:
```html
<div class="teaser-label" data-image="images/articles/your-new-image.jpg">
```

Or edit the articles object:
```javascript
'new-article': {
    title: 'New Article Title',
    content: 'Article content...',
    mainImage: 'images/articles/new-article-main.jpg'
}
```

### Image Content Management Examples:

**Adding a Fiction Story:**
1. Upload images:
   - `images/articles/new-fiction.jpg` (teaser)
   - `images/articles/new-fiction-main.jpg` (main)

2. Update Fikcja page HTML:
```html
<div class="teaser-container" onclick="showArticle('new-fiction')">
    <div class="teaser-label" data-image="images/articles/new-fiction.jpg">GRAFIKA (DO TEKSTU)</div>
    <div class="teaser-text">New Story Title</div>
</div>
```

3. Add to articles object:
```javascript
'new-fiction': {
    title: 'New Story Title',
    content: 'Full story content here...',
    mainImage: 'images/articles/new-fiction-main.jpg'
}
```

## 🔧 Content Management Workflow

### Weekly Updates:
1. **Write content** in text editor
2. **Prepare images** (resize, optimize)
3. **Upload images** to GitHub repository
4. **Edit HTML** to add new teasers
5. **Update articles object** with new content
6. **Test locally** by downloading and opening index.html
7. **Commit changes** to GitHub
8. **Check live site** (updates in 1-2 minutes)

### File Naming Best Practices:
- **Articles**: `category-title-date.jpg` 
  - Example: `fiction-lost-time-2024.jpg`
- **Authors**: `firstname-lastname.jpg`
  - Example: `jan-kowalski.jpg`
- **Use lowercase and hyphens** (no spaces or special characters)

## 📱 Mobile & Performance

### Automatic Features:
- **Responsive design** - works on all devices
- **Image optimization** - automatically scales images
- **Fast loading** - minimal code, GitHub's CDN
- **Fallback system** - text shows if images fail

### Best Practices:
- Keep images under 500KB
- Use JPG for photos, PNG for graphics
- Test on mobile devices
- Compress images before upload

## 🔄 Updating Your Live Site

### Making Changes:
1. **Edit files** in GitHub web interface
2. **Upload new images** through GitHub
3. **Commit changes** with descriptive messages
4. **Wait 1-2 minutes** for site to update
5. **Clear browser cache** to see changes immediately

### Backup Strategy:
- **GitHub is your backup** - all versions saved
- **Download repository** periodically as local backup
- **Use descriptive commit messages** for easy rollback

This system gives you **professional hosting for free** with **easy content management** that non-coders can handle!

## ✏️ Content Management for Non-Coders

### Method 1: Edit content.json file
Create a file called `content.json` with this structure:

```json
{
  "siteTitle": "Design stron",
  "logo": "Nazwa Magazynu",
  "sections": {
    "fiction": "Fikcja",
    "reality": "Realia", 
    "poetry": "Poezja"
  },
  "homepage": {
    "mainSection": "FIKCJA/REALIA/POEZJA",
    "articles": [
      {
        "title": "Tytuł pierwszego artykułu",
        "teaser": "Krótki opis artykułu...",
        "category": "fikcja",
        "image": "images/articles/article1.jpg"
      },
      {
        "title": "Tytuł drugiego artykułu", 
        "teaser": "Kolejny krótki opis...",
        "category": "realia",
        "image": "images/articles/article2.jpg"
      }
    ]
  },
  "archive": {
    "title": "Archiwum",
    "issues": [
      {"number": "Numer I", "link": "#"},
      {"number": "Numer II", "link": "#"},
      {"number": "Numer III", "link": "#"}
    ]
  },
  "authors": [
    {
      "name": "J.K.",
      "photo": "images/authors/author1.jpg",
      "bio": "Krótka biografia autora"
    },
    {
      "name": "A.M.",
      "photo": "images/authors/author2.jpg", 
      "bio": "Kolejna biografia"
    }
  ],
  "support": {
    "title": "Wsparzyj",
    "description": "Pomóż nam tworzyć treści",
    "paypalLink": "https://paypal.me/yourlink"
  }
}
```

### Method 2: Direct HTML Editing (Simple)
To change content without JSON, edit these parts in `index.html`:

#### Change Website Title:
Find: `<h1>Design stron</h1>`
Change to: `<h1>Your Magazine Name</h1>`

#### Change Logo:
Find: `<div class="logo">Logo</div>`
Change to: `<div class="logo">Your Logo</div>`

#### Add New Article Teaser:
Find the section with `TEASER TEKSTU I` and copy the pattern:
```html
<div class="teaser-container">
    <div class="teaser-label">GRAFIKA (DO TEKSTU)</div>
    <div class="teaser-text">YOUR NEW ARTICLE TITLE</div>
    <div class="teaser-label">GRAFIKA (DO TEKSTU)</div>
</div>
```

#### Add New Author:
In the authors section, copy this pattern:
```html
<div class="author-item">
    <div class="author-photo">Zdjęcie</div>
    <div class="author-name">A.B.</div>
</div>
```

## 📝 Adding New Content - Step by Step

### Adding a New Article:
1. **Write your article** in a text editor
2. **Add images** to the `images/articles/` folder
3. **Update the teaser** in homepage section
4. **Create article page** by copying the article template
5. **Link everything together**

### Adding Author Photos:
1. **Resize photos** to 150x150 pixels (use any online resizer)
2. **Save as JPG** in `images/authors/` folder
3. **Update author section** with photo path
4. **Name files clearly** like `author-john-smith.jpg`

### Archive Management:
1. **Create folders** for each issue: `issue-1/`, `issue-2/`
2. **Copy homepage** into each issue folder
3. **Update archive links** to point to issue folders
4. **Keep consistent naming**

## 🔧 Technical Notes

### File Naming Best Practices:
- Use lowercase
- No spaces (use hyphens: `my-article.html`)
- No special characters
- Be descriptive: `fiction-story-january-2024.html`

### Image Guidelines:
- **Author photos**: 150x150px, JPG format
- **Article images**: Max 800px wide, JPG format  
- **Keep file sizes small** (under 500KB)
- **Use descriptive names**: `author-jane-doe.jpg`

### Backup Strategy:
1. **Keep local copies** of all files
2. **Use cloud storage** (Google Drive, Dropbox)
3. **Version control**: Save old versions before changes
4. **Regular exports** from your hosting platform

## 🆘 Common Issues & Solutions

### "Page not loading":
- Check file names match exactly
- Ensure all files uploaded
- Clear browser cache

### "Images not showing":
- Check image file paths
- Ensure images uploaded to correct folder
- Check file extensions (.jpg, .png)

### "Layout broken on mobile":
- The CSS is responsive, but test on phone
- Avoid long words without spaces
- Keep content concise

### "Want to change colors":
In the CSS section, find and modify:
- `#87ceeb` (light blue)
- `#f5f5dc` (beige background)  
- `#daa520` (gold/yellow)

## 📱 Mobile Optimization

The website automatically adapts to phones and tablets. Key features:
- **Responsive navigation** - buttons stack on mobile
- **Readable text** - automatically resizes
- **Touch-friendly** - buttons sized for fingers
- **Fast loading** - minimal code, optimized images

## 🔄 Workflow for Regular Updates

### Weekly Process:
1. **Collect new content** (articles, photos)
2. **Edit content.json** or HTML files
3. **Test locally** by opening index.html in browser
4. **Upload to hosting** (drag & drop to Netlify)
5. **Check live site** and share URL

### Monthly Archive:
1. **Create new issue folder**
2. **Move current content** to archive
3. **Update homepage** with new content
4. **Update archive links**

This system is designed to be **simple to maintain** while remaining **professional looking**. The key is consistency in file naming and regular backups!
