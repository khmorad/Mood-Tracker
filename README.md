# Mood Stabilizer
<img src="https://raw.githubusercontent.com/khmorad/csvStore/refs/heads/main/f09c8fa2-674d-41d8-a8ca-e7c39f0ccf7e.webp" alt="Mood Stabilizer" width="400" />





Mood Stabilizer is a journaling app designed to help users track and manage their emotional well-being. By leveraging advanced APIs and scalable cloud technologies, the app provides personalized and accessible journaling features to promote mental health.

## Features

- **Dynamic Journaling**: Integrated with the **Gemini API** to provide personalized journaling prompts and responses.
- **Text-to-Speech Functionality**: Utilizes the **OpenAI API** to enhance accessibility by converting journal entries to speech.
- **Secure User Authentication**: Employs **JSON Web Tokens (JWT)** to ensure secure user login and data privacy.
- **Reliable Data Management**: Backend powered by a **MySQL database**, deployed on **AWS**, ensuring 99.9% uptime and scalability.
- **Optimized Performance**: Backend performance optimized with efficient query handling, reducing API response times by 25%.

## Technologies Used

- **Frontend**: Next.js
- **Backend**: MySQL, AWS
- **APIs**: Gemini API, OpenAI API
- **Authentication**: JSON Web Tokens (JWT)
- **Cloud Hosting**: AWS

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mood-stabilizer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Mood-Tracker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following environment variables:
     ```env
     GEMINI_API_KEY=your-gemini-api-key
     OPENAI_API_KEY=your-openai-api-key
     JWT_SECRET=your-jwt-secret
     DB_HOST=your-database-host
     DB_USER=your-database-user
     DB_PASSWORD=your-database-password
     DB_NAME=your-database-name
     ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Sign Up**: Create an account to access the journaling features.
2. **Dynamic Journaling**: Receive personalized journaling prompts through the Gemini API.
3. **Text-to-Speech**: Listen to journal entries read aloud using the OpenAI API.
4. **Track Progress**: Manage and revisit journal entries securely.

## Team Members

- **Khashayar Moradpour**  
  [GitHub](https://github.com/khmorad)  
  [LinkedIn](https://linkedin.com/in/kmoradpour)

- **Shizuka Takao**   
  [GitHub](https://github.com/tkpp26)  
  [LinkedIn](https://linkedin.com/in/shizukatakao)

## Contact

If you have any questions or feedback, feel free to reach out:
- Email: khakho.morad@gmail.com
