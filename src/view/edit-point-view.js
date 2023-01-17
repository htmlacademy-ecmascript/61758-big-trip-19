import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { getFullFormatDate, isEmptyObject } from '../utils/util-waypoint.js';
import { upperCaseFirst, lowwerCaseFirst } from '../utils/common.js';
import { OFFERS } from '../const.js';

const createDestinationWithOffersViewTemplate = (destinationPoint) => {
  const { description } = destinationPoint;
  return `<section class="event__section  event__section--destination">
  <h3 class="event__section-title  event__section-title--destination">Destination</h3>
  <p class="event__destination-description">${description}</p>
  </section>`;
};

const createDestinationWithoutOffersViewTemplate = (destinationPoint) => {
  const { description, pictures } = destinationPoint;
  return `<section class="event__section  event__section--destination">
  <h3 class="event__section-title  event__section-title--destination">Destination</h3>
  <p class="event__destination-description">${description}</p>
  <div class="event__photos-container">
                      <div class="event__photos-tape">
                      ${pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                      </div>
                    </div>
  </section>`;
};

const isCheckedOffer = (offer, pointOffers) => {
  let status = false;
  for (let i = 0; i < pointOffers.length; i++) {
    const pointOffer = pointOffers[i];
    if(pointOffer.id === offer.id){
      status = true;
    }
  }
  return status;
};

const showDestinationTitle = (destination) => `<input class="event__input  event__input--destination" id="event-destination-${destination.id}" type="text" name="event-destination" value="${destination.name}" list="destination-list-${destination.id}">`;

const createOffersViewTemplate = (point, allOffers) => `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${allOffers.map((offer) => `<div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${lowwerCaseFirst(offer.title.split(' ')[0])}" type="checkbox" name="event-offer-${lowwerCaseFirst(offer.title.split(' ')[0])}" ${isCheckedOffer(offer, point.offers) ? 'checked' : ''}>
            <label class="event__offer-label" for="event-offer-${lowwerCaseFirst(offer.title.split(' ')[0])}-${offer.id}">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
    </div>`).join('')}
    </div>
  </section>`;

function createEditViewTemplate(waypoint) {
  const { type, destination, dateFrom, dateTo, basePrice, id, offersByType, allTypes, allDestinationNames } = waypoint;
  return `<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox"}>

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${allTypes.map((pointType, index) => `<div class="event__type-item">
            <input id="event-type-${pointType}-${index}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${pointType}" ${type === pointType ? 'checked' : ''}>
            <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-${index}">${upperCaseFirst(pointType)}</label>
            </div>`).join('')}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-${destination.id}">
        ${upperCaseFirst(type)}
        </label>
        ${!isEmptyObject(destination) ? showDestinationTitle(destination) : ''}
        <datalist id="destination-list-${destination.id}">
          ${allDestinationNames.map((destinationName) => `<option value="${destinationName}" ${destinationName === destination.name ? 'selected' : ''}></option>`).join('')}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-${id}">From</label>
        <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${getFullFormatDate(dateFrom)}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-${id}">To</label>
        <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${getFullFormatDate(dateTo)}">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-${id}">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">Delete</button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    <section class="event__details">
      ${offersByType.length > 0 ? createOffersViewTemplate(waypoint, offersByType) : createDestinationWithoutOffersViewTemplate(destination)}
      ${!isEmptyObject(destination) && offersByType.length > 0 ? createDestinationWithOffersViewTemplate(destination) : ''}
    </section>
  </form>
  </li>`;
}

export default class EditPointView extends AbstractStatefulView {
  #handleCloseEditClick = null;
  #handleDeleteClick = null;
  #handleSaveClick = null;
  constructor({ waypoint, onCloseEditClick, onDeleteClick, onSaveClick }) {
    super();
    this._setState(EditPointView.parseWaypointToState(waypoint));
    this.#handleCloseEditClick = onCloseEditClick;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleSaveClick = onSaveClick;

    this.element.querySelector('form').addEventListener('reset', this.#deleteClickHandler);
    this.element.querySelector('form').addEventListener('submit', this.#saveClickHandler);

    this._restoreHandlers();
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseEditClick();
  };

  #deleteClickHandler = (evt) =>{
    evt.preventDefault();
    this.#handleDeleteClick();
  };

  #saveClickHandler = (evt) =>{
    evt.preventDefault();
    this.#handleSaveClick();
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const offers = OFFERS.find((_value, index, offer) => offer[index].type === evt.target.value);
    this.updateElement({
      type: evt.target.value,
      offersByType: offers.offers,
      offers: []
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const destination = this._state.allDestinations.filter((element) => element.name === evt.target.value);
    this.updateElement({
      destination: destination[0]
    });
  };

  get template() {
    return createEditViewTemplate(this._state);
  }

  static parseWaypointToState(waypoint) {
    return {...waypoint};
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
    const types = this.element.querySelectorAll('.event__type-input');
    for (let i = 0; i < types.length; i++){
      types[i].addEventListener('click', this.#typeChangeHandler);
    }

    const destinations = this.element.querySelector('.event__input--destination');
    destinations.addEventListener('change', this.#destinationChangeHandler);
  }
}

