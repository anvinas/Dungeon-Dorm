import React, { useState } from 'react';

function CardUI() {
  // Retrieve user data from localStorage
  let _ud: any = localStorage.getItem('user_data');
  let ud = JSON.parse(_ud);
  let userId: string = ud.id;
  let firstName: string = ud.firstName;
  let lastName: string = ud.lastName;

  // State variables
  const [message, setMessage] = useState('');
  const [searchResults, setResults] = useState('');
  const [cardList, setCardList] = useState(''); // This will hold the comma-separated list of cards
  const [search, setSearchValue] = React.useState(''); // State for the search input
  const [card, setCardNameValue] = React.useState(''); // State for the add card input

  // Function to handle adding a card (ASYNC VERSION ONLY)
  async function addCard(e: any): Promise<void> {
    e.preventDefault(); // Prevent default form submission

    // Basic validation
    if (!card.trim()) {
      setMessage("Please enter a card to add.");
      return;
    }

    let obj = { userId: userId, card: card.trim() };
    let js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5000/api/addcard', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });
      let txt = await response.text();
      let res = JSON.parse(txt);

      if (res.error && res.error.length > 0) {
        setMessage("API Error: " + res.error);
      } else {
        setMessage('Card has been added');
        setCardNameValue(''); // Clear the input field after successful addition
        // Optionally, trigger a search or update the card list here to show the new card
      }
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

  // Function to handle searching for cards (ASYNC VERSION ONLY)
  async function searchCard(e: any): Promise<void> {
    e.preventDefault(); // Prevent default form submission

    // Basic validation
    if (!search.trim()) {
      setResults("Please enter a search term.");
      setCardList(''); // Clear previous results
      return;
    }

    let obj = { userId: userId, search: search.trim() };
    let js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5000/api/searchcards', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });
      let txt = await response.text();
      let res = JSON.parse(txt);
      let _results = res.results;
      let resultText = '';

      if (_results.length > 0) {
        for (let i = 0; i < _results.length; i++) {
          resultText += _results[i];
          if (i < _results.length - 1) {
            resultText += ', ';
          }
        }
        setResults('Card(s) have been retrieved:'); // Update message to indicate success
        setCardList(resultText); // Set the actual list of cards
      } else {
        setResults('No cards found for your search.');
        setCardList('');
      }

    } catch (error: any) {
      alert(error.toString()); // Using alert for critical errors
      setResults("Error during search: " + error.toString());
      setCardList('');
    }
  }

  // Event handler for search input change
  function handleSearchTextChange(e: any): void {
    setSearchValue(e.target.value);
  }

  // Event handler for add card input change
  function handleCardTextChange(e: any): void {
    setCardNameValue(e.target.value);
  }

  return (
    <div id="cardUIDiv">
      <br />
      <div>Welcome, {firstName} {lastName}!</div> {/* Display user info */}
      <br />
      Search: <input type="text" id="searchText" placeholder="Card To Search For"
        onChange={handleSearchTextChange}
        value={search} // Controlled component
      />
      <button type="button" id="searchCardButton" className="buttons"
        onClick={searchCard}> Search Card</button><br />
      <span id="cardSearchResult">{searchResults}</span>
      <p id="cardList">{cardList}</p><br /><br />
      Add: <input type="text" id="cardText" placeholder="Card To Add"
        onChange={handleCardTextChange}
        value={card} // Controlled component
      />
      <button type="button" id="addCardButton" className="buttons"
        onClick={addCard}> Add Card </button><br />
      <span id="cardAddResult">{message}</span>
    </div>
  );
}

export default CardUI;