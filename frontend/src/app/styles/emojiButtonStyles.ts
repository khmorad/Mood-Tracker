// src/app/styles/emojiButtonStyles.ts

export const emojiButtonStyles = `
  .emoji-button {
  margin-left: 20px;
    background-color: #f9fafb;
    border: 2px solid #e0e0e0;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }

  .emoji-button:hover {
    background-color: #e2e8f0;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    transform: scale(1.2);
  }

  .nav-title {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    white-space: nowrap;
    font-size: 14px;
    background-color: #ffffff;
    padding: 4px 10px;
    border-radius: 4px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }

  .emoji-button:hover + .nav-title {
    opacity: 1;
    transform: translateY(-15px);
  }
`;
