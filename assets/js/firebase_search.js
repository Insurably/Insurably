// firebase_search.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to get trade suggestions based on input
export async function searchTrades() {
  const input = document.getElementById('searchTradeForm').value.trim().toLowerCase();
  let suggestionsContainer = document.getElementById('suggestionsContainer');

  // Clear previous suggestions
  suggestionsContainer.innerHTML = '';

  if (input.length < 2) {
    // Hide suggestions dropdown if input is less than 2 characters
    suggestionsContainer.style.display = 'none';
    return;
  }

  try {
    // Query Firestore for matching trade names
    const q = query(collection(db, "trades_products"), where("trade_name_lowercase", ">=", input), where("trade_name_lowercase", "<=", input + '\uf8ff'));
    const querySnapshot = await getDocs(q);

    let suggestions = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      suggestions.push({
        trade_name: data.trade_name,
        product_type: data.product_type,
        quote_form_url: data.quote_form_url,
      });
    });

    // Display the suggestions in the dropdown container
    if (suggestions.length > 0) {
      suggestionsContainer.style.display = 'block';
      suggestionsContainer.style.position = 'absolute';
      const inputRect = document.getElementById('searchTradeForm').getBoundingClientRect();
      suggestionsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;
      suggestionsContainer.style.left = `${inputRect.left + window.scrollX}px`;
      suggestionsContainer.style.width = `${inputRect.width}px`;

      suggestions.forEach((suggestion) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('dropdown-item');
        suggestionItem.innerHTML = `
          <strong>${suggestion.trade_name}</strong> - ${suggestion.product_type}
          <br>
          <a href="${suggestion.quote_form_url}" target="_blank">Get Quote</a>
        `;
        suggestionsContainer.appendChild(suggestionItem);
      });
    } else {
      // Hide suggestions dropdown if no matches found
      suggestionsContainer.style.display = 'none';
    }
  } catch (error) {
    console.error("Error fetching trade suggestions: ", error);
  }
}

// Move suggestionsContainer to body
const originalSuggestionsContainer = document.getElementById('suggestionsContainer');
document.body.appendChild(originalSuggestionsContainer);

// Add event listener to the input box
document.getElementById('searchTradeForm').addEventListener('input', searchTrades);