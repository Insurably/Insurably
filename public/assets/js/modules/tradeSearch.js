// tradeSearch.js

import { fetchAllTrades } from "../../supascaff.js";

export async function initializeTradeSearch() {
  const tradeInput = document.getElementById("tradeInput");
  const tradeSuggestions = document.getElementById("tradeSuggestions");
  const tradeSelected = document.getElementById("tradeSelected");
  const tradeName = document.getElementById("tradeName");
  const changeTrade = document.getElementById("changeTrade");

  let trades = await fetchAllTrades(); // Fetch all trades with pagination
  let filteredTrades = []; // Store filtered trades
  let selectedIndex = -1; // Track active selection in dropdown

  // Function to filter and display suggestions
  tradeInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    tradeSuggestions.innerHTML = "";
    selectedIndex = -1; // Reset selection index

    if (query.length < 2) {
      tradeSuggestions.classList.add("d-none");
      return;
    }

    // Rank matches: exact first, then partial matches
    filteredTrades = trades.filter(trade => trade.toLowerCase().includes(query));
    filteredTrades.sort((a, b) => {
      if (a.toLowerCase() === query) return -1;
      if (b.toLowerCase() === query) return 1;
      if (a.toLowerCase().startsWith(query) && !b.toLowerCase().startsWith(query)) return -1;
      if (!a.toLowerCase().startsWith(query) && b.toLowerCase().startsWith(query)) return 1;
      return 0;
    });

    if (filteredTrades.length > 0) {
      filteredTrades.forEach((trade, index) => {
        const suggestionItem = document.createElement("button");
        suggestionItem.classList.add("list-group-item", "list-group-item-action");
        suggestionItem.textContent = trade;
        suggestionItem.setAttribute("data-index", index);

        // Clicking a suggestion manually selects it
        suggestionItem.addEventListener("click", function () {
          selectTrade(trade);
        });

        tradeSuggestions.appendChild(suggestionItem);
      });

      tradeSuggestions.classList.remove("d-none");
    } else {
      tradeSuggestions.classList.add("d-none");
    }
  });

  // Function to handle trade selection
  function selectTrade(trade) {
    tradeInput.value = "";
    tradeInput.setAttribute("disabled", "true");
    tradeInput.classList.add("d-none");
    tradeSuggestions.classList.add("d-none");
    tradeSelected.classList.remove("d-none");
    tradeName.textContent = trade;

    tradeInput.classList.remove("is-invalid");
    tradeInput.blur();
    document.activeElement.blur();
  }

  // Handle keyboard navigation in dropdown
  tradeInput.addEventListener("keydown", function (event) {
    const suggestionItems = tradeSuggestions.querySelectorAll(".list-group-item");
    if (suggestionItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (selectedIndex < suggestionItems.length - 1) {
        selectedIndex++;
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredTrades.length) {
        selectTrade(filteredTrades[selectedIndex]);
      }
    }

    // Highlight selected item
    suggestionItems.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  });

  // Automatically select the first result if the user clicks away (blur)
  tradeInput.addEventListener("blur", function () {
    setTimeout(() => {
      if (filteredTrades.length > 0 && tradeSelected.classList.contains("d-none")) {
        selectTrade(filteredTrades[0]); // Auto-select first result
      }
    }, 200); // Delay allows clicks to register first
  });

  // Change trade functionality
  changeTrade.addEventListener("click", function (event) {
    event.preventDefault();
    tradeSelected.classList.add("d-none");
    tradeInput.classList.remove("d-none");
    tradeInput.removeAttribute("disabled");
    tradeInput.classList.remove("is-invalid");
    tradeInput.focus();
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", function (event) {
    if (!tradeInput.contains(event.target) && !tradeSuggestions.contains(event.target)) {
      tradeSuggestions.classList.add("d-none");
    }
  });
}
