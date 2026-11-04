class Api {
  // Stores the server URL and request headers
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.headers = options.headers;
  }

  // Gets cards from the server
  getInitialCards() {
    return fetch(`${this.baseUrl}/cards`, {
      headers: this.headers,
    }).then((res) => this._checkResponse(res));
  }

  // Gets the user's profile information
  getUserInfo() {
    return fetch(`${this.baseUrl}/users/me`, {
      headers: this.headers,
    }).then((res) => this._checkResponse(res));
  }

  // Sends updated profile information to the server
  updateUserInfo(data) {
    return fetch(`${this.baseUrl}/users/me`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(data),
    }).then((res) => this._checkResponse(res));
  }

  // Adds a new card to the server
  addCard(data) {
    return fetch(`${this.baseUrl}/cards`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    }).then((res) => this._checkResponse(res));
  }

  deleteCard(cardId) {
    return fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: "DELETE",
      headers: this.headers,
    }).then((res) => this._checkResponse(res));
  }

  likeCard(cardId) {
    return fetch(`${this.baseUrl}/cards/${cardId}/likes`, {
      method: "PUT",
      headers: this.headers,
    }).then((res) => this._checkResponse(res));
  }

  unlikeCard(cardId) {
    return fetch(`${this.baseUrl}/cards/${cardId}/likes`, {
      method: "DELETE",
      headers: this.headers,
    }).then((res) => this._checkResponse(res));
  }

  updateAvatar(data) {
    return fetch(`${this.baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(data),
    }).then((res) => this._checkResponse(res));
  }

  getInitialData() {
    return Promise.all([this.getUserInfo(), this.getInitialCards()]);
  }

  // Checks if a request succeeded and handles errors
  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }

    return Promise.reject(`Error: ${res.status}`);
  }
}

export default Api;
