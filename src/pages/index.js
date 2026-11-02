import "./index.css";

import {
  enableValidation,
  resetValidation,
  validationConfig,
} from "../scripts/validation.js";

import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "d8650681-6c67-4b5b-894e-6a24c32172d6",
    "Content-Type": "application/json",
  },
});


const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector("#profile-name-input");
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostFormElement = newPostModal.querySelector(".modal__form");
const imageLinkInput = newPostModal.querySelector("#card-image-input");
const descriptionInput = newPostModal.querySelector("#card-caption-input");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");

const deleteModal = document.querySelector("#delete-modal");
const deleteModalForm = deleteModal.querySelector(".modal__form");

const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarForm = editAvatarModal.querySelector(".modal__form");
const avatarLinkInput = editAvatarModal.querySelector("#avatar-link-input");
const editAvatarBtn = document.querySelector(".profile__avatar-edit-btn");

const modals = document.querySelectorAll(".modal");

let cardToDelete = null;
let currentUserId;

enableValidation(validationConfig);

// MODAL HELPERS

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");

    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  if (!modal) {
    return;
  }

  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);

  if (modal === deleteModal) {
    cardToDelete = null;
  }
}

// Handles loading text and prevents duplicate submissions.
function setButtonLoading(button, isLoading, loadingText) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText;
    button.disabled = false;
  }
}

// Close buttons and outside clicks for every modal.
modals.forEach(function (modal) {
  const closeButton = modal.querySelector(".modal__close-btn");

  closeButton.addEventListener("click", function () {
    closeModal(modal);
  });

  modal.addEventListener("mousedown", function (evt) {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});

// EDIT AVATAR

editAvatarBtn.addEventListener("click", function () {
  editAvatarForm.reset();
  resetValidation(editAvatarForm, validationConfig);
  openModal(editAvatarModal);
});

function handleEditAvatarSubmit(evt) {
  evt.preventDefault();

  const submitButton = editAvatarForm.querySelector(".modal__submit-btn");

  setButtonLoading(submitButton, true, "Saving...");

  api
    .updateAvatar({
      avatar: avatarLinkInput.value,
    })
    .then((updatedUser) => {
      profileAvatar.src = updatedUser.avatar;

      editAvatarForm.reset();
      resetValidation(editAvatarForm, validationConfig);
      closeModal(editAvatarModal);
    })
    .catch((error) => {
      console.error("Error updating avatar:", error);
    })
    .finally(() => {
      setButtonLoading(submitButton, false);
    });
}

editAvatarForm.addEventListener("submit", handleEditAvatarSubmit);

// EDIT PROFILE

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  resetValidation(editProfileForm, validationConfig);
  openModal(editProfileModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const submitButton = editProfileForm.querySelector(".modal__submit-btn");

  setButtonLoading(submitButton, true, "Saving...");

  api
    .updateUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((updatedUser) => {
      profileNameEl.textContent = updatedUser.name;
      profileDescriptionEl.textContent = updatedUser.about;

      closeModal(editProfileModal);
    })
    .catch((error) => {
      console.error("Error updating profile:", error);
    })
    .finally(() => {
      setButtonLoading(submitButton, false);
    });
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// NEW POST

newPostBtn.addEventListener("click", function () {
  newPostFormElement.reset();
  resetValidation(newPostFormElement, validationConfig);
  openModal(newPostModal);
});

function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const submitButton = newPostFormElement.querySelector(".modal__submit-btn");

  setButtonLoading(submitButton, true, "Saving...");

  api
    .addCard({
      name: descriptionInput.value,
      link: imageLinkInput.value,
    })
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);

      newPostFormElement.reset();
      resetValidation(newPostFormElement, validationConfig);
      closeModal(newPostModal);
    })
    .catch((error) => {
      console.error("Error adding card:", error);
    })
    .finally(() => {
      setButtonLoading(submitButton, false);
    });
}

newPostFormElement.addEventListener("submit", handleNewPostSubmit);

// DELETE CONFIRMATION

deleteModalForm.addEventListener("submit", function (evt) {
  evt.preventDefault();

  if (!cardToDelete) {
    return;
  }

  const { cardId, cardElement } = cardToDelete;
  const submitButton = deleteModalForm.querySelector(".modal__submit-btn");

  setButtonLoading(submitButton, true, "Deleting...");

  api
    .deleteCard(cardId)
    .then(() => {
      cardElement.remove();
      closeModal(deleteModal);
    })
    .catch((error) => {
      console.error("Error deleting card:", error);
    })
    .finally(() => {
      setButtonLoading(submitButton, false);
    });
});

// CREATE CARDS

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardTitle = cardElement.querySelector(".card__title");
  const cardImage = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  cardTitle.textContent = data.name;
  cardImage.src = data.link;
  cardImage.alt = data.name;

  // Display the like status saved on the server.
  if (data.isLiked) {
    likeButton.classList.add("card__like-button_active");
  }

  // Only show the delete button on your own cards.
  if (data.owner !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", function () {
      cardToDelete = {
        cardId: data._id,
        cardElement: cardElement,
      };

      openModal(deleteModal);
    });
  }

  // Save likes/unlikes to the server.
  likeButton.addEventListener("click", function () {
    if (likeButton.disabled) {
      return;
    }

    const isLiked = likeButton.classList.contains(
      "card__like-button_active"
    );

    const request = isLiked
      ? api.unlikeCard(data._id)
      : api.likeCard(data._id);

    likeButton.disabled = true;

    request
      .then((updatedCard) => {
        likeButton.classList.toggle(
          "card__like-button_active",
          updatedCard.isLiked
        );
      })
      .catch((error) => {
        console.error("Error updating card like:", error);
      })
      .finally(() => {
        likeButton.disabled = false;
      });
  });

  // Open image preview.
  cardImage.addEventListener("click", function () {
    previewImage.src = data.link;
    previewImage.alt = data.name;
    previewCaption.textContent = data.name;

    openModal(previewModal);
  });

  return cardElement;
}

// LOAD USER AND CARDS FROM THE SERVER

// TripleTen requires Promise.all() inside the Api class.
api
  .getInitialData()
  .then(([userInfo, initialCards]) => {
    currentUserId = userInfo._id;

    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;

    if (userInfo.avatar) {
      profileAvatar.src = userInfo.avatar;
    }

    initialCards.forEach(function (cardData) {
      const cardElement = getCardElement(cardData);
      cardsList.append(cardElement);
    });
  })
  .catch((error) => {
    console.error("Error fetching initial data:", error);
  });
