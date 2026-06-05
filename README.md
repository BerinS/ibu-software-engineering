# IBU Software Engineering Course 

## Backend Setup Instructions
```
1 - Install NodeJS LTS
2 - Install PostgreSQL and setup database from init.sql (located in /backend/db)
3 - Once Node.js is installed, navigate to the cloned repo folder and run: npm install
4 - Make a .env file in /backend with DB credentials.
5 - Run the backend API in dev mode with: npm run dev
```

Example env file:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=scanova
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=scanova_super_secret_key_change_in_production
```
*Leave the jwt like the example above while testing.

## Frontend Setup Instructions
```
1 - Navigate to the frontend folder and run: npm install
2 - In the command line run: npm run dev, and you're done
*don't forget to have the backend running
```
## UI Screenshots
![All Events page](frontend/src/images/UI%20Screenshots/AllEvents.jpg)