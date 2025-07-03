function change_custom_range_val(range) {
	var value = range.value;
	var value_last_number = value[value.length - 1];
	var value_last_second_number = value[value.length - 2];
	if (value_last_number == 1 && value_last_second_number != 1) {
		range.closest('.custom-select').querySelector('.custom-select__range-value-units').innerHTML = 'тонна';
	} else if (2 <= value_last_number && value_last_number <= 4 && value_last_second_number != 1) {
		range.closest('.custom-select').querySelector('.custom-select__range-value-units').innerHTML = 'тонны';
	} else {
		range.closest('.custom-select').querySelector('.custom-select__range-value-units').innerHTML = 'тонн';
	}

	range.style.setProperty('--value', value);
	range.style.setProperty('--min', range.min == '' ? '0' : range.min);
	range.style.setProperty('--max', range.max == '' ? '100' : range.max);
	range.addEventListener('input', () => range.style.setProperty('--value', value));
	if (range.closest('.custom-select').querySelector('.custom-select__range-value-value')) {
		range.closest('.custom-select').querySelector('.custom-select__range-value-value').innerHTML = value;
	}
}

function change_range_values(range, max_val, ) {
	var middle_val = max_val / 2;
	range.setAttribute('max',max_val);
	range.style.setProperty('--value', range.value);
	range.style.setProperty('--min', range.min == '' ? '0' : range.min);
	range.style.setProperty('--max', range.max == '' ? '100' : range.max);
	range.addEventListener('input', () => range.style.setProperty('--value', range.value));
	if (range.closest('.custom-select').querySelector('.custom-select__range-value-value')) {
		range.closest('.custom-select').querySelector('.custom-select__range-value-value').innerHTML = range.value;
	}
	if (range.closest('.custom-select').querySelector('.custom-select__range-data-val--middle')) {
		range.closest('.custom-select').querySelector('.custom-select__range-data-val--middle').innerHTML = middle_val + " тонн";
	}
	if (range.closest('.custom-select').querySelector('.custom-select__range-data-val--max')) {
		range.closest('.custom-select').querySelector('.custom-select__range-data-val--max').innerHTML = max_val + " тонн";
	}
}

function send_main_form(e) {
	var input = e.target;
	var range = document.querySelector('input[name="volume"]');
	if (input.classList.contains('custom-select__select') || input.classList.contains('custom-select__range') || (input.hasAttribute('name') && (input.getAttribute('name') == 'fuel-type' || input.getAttribute('name') == 'brand' || input.getAttribute('name') == 'additional_service[]' || input.getAttribute('name') == 'promo'))) {

		if (input.getAttribute('name') == 'additional_service[]') {
			if (document.querySelectorAll('input[name="additional_service[]"]:checked').length > 4) {
				e.target.checked = false;
			}
		}

		var form_data = new FormData(document.querySelector('#main-form'));

		fetch('/calc.php', {
	        method: 'POST',
	        body: form_data
	    })
	    .then(response => response.json()) // Or response.text(), depending on server response
	    .then(data => {
	    	console.log(data);
	    	if (data.hasOwnProperty('rate') && document.querySelector('.rate-block__top-selected-rate')) {
	    		document.querySelector('.rate-block__top-selected-rate').innerHTML = data.rate;
	    		if (document.querySelectorAll('input[name="promo"]').length > 0) {
	    			document.querySelectorAll('input[name="promo"]').forEach((promo_input)=>{
			    		if (data.rate == 'Эконом') {
			    			if (promo_input.value == 2 || promo_input.value == 5) {
			    				promo_input.disabled = false;
			    			} else {
			    				promo_input.disabled = true;
			    				if (promo_input.checked) {
			    					promo_input.checked = false;
			    				}
			    			}
			    		} else if(data.rate == 'Избранный') {
			    			if (promo_input.value == 5 || promo_input.value == 20) {
			    				promo_input.disabled = false;
			    			} else {
			    				promo_input.disabled = true;
			    				if (promo_input.checked) {
			    					promo_input.checked = false;
			    				}
			    			}
			    		} else if(data.rate == 'Премиум') {
			    			if (promo_input.value == 20 || promo_input.value == 50) {
			    				promo_input.disabled = false;
			    			} else {
			    				promo_input.disabled = true;
			    				if (promo_input.checked) {
			    					promo_input.checked = false;
			    				}
			    			}
			    		}
	    			});
	    		}
	    	}
	    	if (data.hasOwnProperty('rate')) {
	    		if (document.querySelector('.open-popup__rate-name')) {
		    		document.querySelector('.open-popup__rate-name').innerHTML = data.rate;	
	    		}
	    		if (document.querySelector('.popup__rate-name')) {
		    		document.querySelector('.popup__rate-name').innerHTML = data.rate;	
	    		}
	    		if (document.querySelector('.popup-btn__rate-name')) {
		    		document.querySelector('.popup-btn__rate-name').innerHTML = data.rate;	
	    		}
	    	}
			if (range && range.getAttribute('max') != data.range_max) {
				change_range_values(range, data.range_max);
			}
	    	if (data.hasOwnProperty('available_brand_list') && document.querySelector('input[name="brand"]')) {
	    		var available_brand_list_arr = data.available_brand_list.split(',');
	    		document.querySelectorAll('input[name="brand"]').forEach((brand_input)=>{
	    			if (available_brand_list_arr.includes(brand_input.value)) {
	    				brand_input.disabled = false;
	    			} else {
	    				brand_input.disabled = true;
    					if (brand_input.checked) {
    						brand_input.checked = false
    					}
	    			}
	    		});
	    		if (!document.querySelectorAll('input[name="brand"]:checked').length > 0) {
	    			document.querySelectorAll('input[name="brand"]:not(:disabled)')[0].checked = true;
	    		}
	    	}
	    	if (data.hasOwnProperty('total_discount_in_rub_per_month') && document.querySelector('.rate-block-total__top-month-price-number')) {
	    		document.querySelector('.rate-block-total__top-month-price-number').innerHTML = data.total_discount_in_rub_per_month.toLocaleString();
	    	}
	    	if (data.hasOwnProperty('total_discount_in_rub_per_year') && document.querySelector('.rate-block-total__top-year-price-number')) {
	    		var discount_per_year = data.total_discount_in_rub_per_year.toLocaleString();
	    		if (data.total_discount_in_rub_per_year > 1000000) {
					var discount_per_year = Math.floor(data.total_discount_in_rub_per_year / 1000000) + " млн";
	    		}
	    		document.querySelector('.rate-block-total__top-year-price-number').innerHTML = discount_per_year;
	    	}
	    })
	    .catch(error => console.error('Error:', error));
	}
}
document.addEventListener('change',send_main_form);

function open_closed_popup(e) {
	if (e.target.classList.contains('open-popup') || e.target.closest('a.open-popup')) {
		e.preventDefault();
		if (document.querySelector('#popup')) {
			document.querySelector('#popup').classList.add('open');
		}
	}
	if (e.target.classList.contains('popup__close')) {
		if (document.querySelector('#popup') && document.querySelector('#popup').classList.contains('open')) {
			document.querySelector('#popup').classList.remove('open');
		}
	}
}
window.addEventListener('click',open_closed_popup);

function check_input(input_name) {
	if (document.querySelector('input[name="' + input_name + '"]')) {
		if (document.querySelector('input[name="' + input_name + '"]').value == "") {
			document.querySelector('input[name="' + input_name + '"]').classList.add('error');
		} else {
			if (document.querySelector('input[name="' + input_name + '"]').classList.contains('error')) {
				document.querySelector('input[name="' + input_name + '"]').classList.remove('error');
			}
		}
	}
}

function send_email(e) {
	if (e.target.classList.contains('popup-btn')) {
		e.preventDefault();
		var form_data = new FormData(document.querySelector('#main-form'));
		form_data.append('send_email',true);

		fetch('/calc.php', {
	        method: 'POST',
	        body: form_data
	    })
	    .then(response => response.json()) // Or response.text(), depending on server response
	    .then(data => {
	    	document.querySelectorAll('input.error').forEach((error_input)=>{
	    		error_input.classList.remove('error');
	    	});
	    	if (data.error_input_list) {
	    		var error_message = "";
	    		var error_input_list_arr = data.error_input_list.split(',');
	    		error_input_list_arr.forEach((input_name)=>{
	    			document.querySelector('input[name="' + input_name + '"]').classList.add('error');
	    			if (document.querySelector('input[name="' + input_name + '"]').hasAttribute('placeholder')) {
		    			var input_placeholder = document.querySelector('input[name="' + input_name + '"]').getAttribute('placeholder');
		    		} else {
		    			var input_placeholder = "Согласие на обработку персональных данных";
		    		}
	    			if (error_message != "") {
	    				error_message = error_message + ", ";
	    			}
	    			error_message = error_message + input_placeholder;
	    		});
	    		error_message = "Ошибка!<br>Следующие поля не заполнены или заполнены неправильно:<br>" + error_message;
	    		if (document.querySelector('.popup__message').classList.contains('success')) {
	    			document.querySelector('.popup__message').classList.remove('success');
	    		}
	    		document.querySelector('.popup__message').classList.add('error');
	    		document.querySelector('.popup__message').innerHTML = error_message;
	    	}
	    	if (data.success) {
	    		if (document.querySelector('.popup__message').classList.contains('error')) {
	    			document.querySelector('.popup__message').classList.remove('error');
	    		}
	    		document.querySelector('.popup__message').classList.add('success');
	    		document.querySelector('.popup__message').innerHTML = data.success;
	    	}
	    	console.log(data);
	    })
	    .catch(error => console.error('Error:', error));
	}
}
window.addEventListener('click',send_email);