# Logic League

A fully functional website for the Logic League inter-college puzzle event.

## Features

- Responsive design with beautiful purple/blue theme
- Interactive animations and floating icons
- Registration form for participants
- Standings page to display team scores
- Admin login system for event organizers
- Admin panel to manage teams and update scores
- Complete tournament management with 4 scoring rounds

## Deployment Instructions

### Option 1: Deploy to Vercel (Recommended)

1. Create a GitHub repository and push these files to it
2. Sign up for a free Vercel account at [vercel.com](https://vercel.com)
3. Connect your GitHub account to Vercel
4. Import your repository and click "Deploy"
5. Vercel will automatically detect the configuration and deploy your site

### Option 2: Deploy to Netlify

1. Create a GitHub repository and push these files to it
2. Sign up for a free Netlify account at [netlify.com](https://netlify.com)
3. Connect your GitHub account to Netlify
4. Import your repository and click "Deploy"

### Option 3: Run locally

1. Install Node.js if you don't have it already
2. Open a terminal in the project folder
3. Run `npm install` to install dependencies
4. Run `npm start` to start a local server
5. Open your browser to the displayed URL (usually http://localhost:3000)

## Admin Login

To access the admin panel, use the following credentials:
- Username: admin
- Password: logicleague2025

## File Structure

- `index.html` - The main homepage
- `login.html` - Admin login page
- `admin.html` - Admin control panel
- `standings.html` - Public standings page
- `styles.css` - All styling for the website
- `script.js` - All JavaScript functionality
- `package.json` - Project configuration
- `vercel.json` - Vercel deployment configuration

## Customization

You can customize this website by:
1. Editing the content in HTML files
2. Modifying styles in styles.css
3. Adjusting functionality in script.js

## Notes

- This website uses client-side storage (localStorage) for demonstration purposes
- In a production environment, you would connect to a backend database
- The admin credentials are hardcoded in script.js for demonstration
- In a real application, you would implement proper authentication

## License

MIT License
