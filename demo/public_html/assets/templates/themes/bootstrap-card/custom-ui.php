<!-- Bootstrap inspired Braintree Hosted Fields example -->
<div class="bt-custom-ui-wrapper panel panel-default bootstrap-basic">
	<div class="panel-heading">
		<h3 class="panel-title">Enter Card Details</h3>
	</div>

	<div class="row">
		<div class="form-group col-xs-8">
			<label class="control-label">Card Number</label>
			<!--  Fields div container -->
			<input type="text" min="12" class="form-control" id="card_number" /> <span class="helper-text"></span>
		</div>
		<div class="form-group col-xs-4">
			<label class="control-label ">Expiration Date</label>
			<div>
				<!--  Fields div container -->
				<input type="text" min="5" maxlength="7" class="form-control" id="card_expiry" />
			</div>
		</div>
	</div>
	<div class="row">
		<div class="form-group col-xs-4">
			<label class="control-label">Security Code</label>
			<!--  Fields div container -->
			<input type="text" min="3" maxlength="4" class="form-control" id="card_cvv">
		</div>
		<div class="form-group col-xs-4">
			<label class="control-label">Zipcode</label>
			<!--  Fields div container -->
			<input type="text" min="3" class="form-control" id="card_postal_code" name="card_postal_code" />
		</div>

	</div>
</div>
