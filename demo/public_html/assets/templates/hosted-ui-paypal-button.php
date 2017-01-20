<div class="bt-hosted-ui-paypal-button-wrapper">
	<header class="header">
		<!-- <h1 class="price">
			<span class="price__dollar">$</span>15.00<span class="price__time">/ mo</span>
		</h1>
		<p class="desc">Chicharrón Subscription</p>-->
	</header>

	<div class="pay-select">
		<div class="pay-select__item pay-select--card is-active">
			<img src="assets/templates/img/card.svg" alt="" />
			<p>Debit/Credit Card</p>
		</div>

		<div class="separator"></div>

		<div class="pay-select__item pay-select--paypal">
			<img src="assets/templates/img/paypal.svg" alt="" />
			<p>PayPal</p>
		</div>
	</div>

	<div class="select-body">
		<div class="select-body__content select-body--card is-active">
			<label class="form__label" for="card_number">Card Number</label>
			<div class="card-input" id="card_number" placeholder="•••• •••• •••• ••••"></div>

			<label class="form__label" for="card_expiry">Expiration Date</label>
			<div class="card-input" id="card_expiry" placeholder="MM/YY"></div>

			<label class="form__label" for="card_cvv">CVV</label>
			<div class="card-input" id="card_cvv" placeholder="••••"></div>

			<label class="form__label" for="card_postal_code">Billing Zip Code</label>
			<div class="card-input" id="card_postal_code" placeholder="Postal code"></div>

		</div>

		<div class="bt-paypal-wrapper select-body__content select-body--paypal"></div>
	</div>
</div>