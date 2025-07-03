<?php

function get_rate($fuel_type, $volume) {
	$rate = "";
	if ($fuel_type == "gasoline") {
		if ($volume <= 100) {
			$rate = "Эконом";
		} elseif ($volume > 100 && $volume <= 300) {
			$rate = "Избранный";
		} elseif (300 < $volume) {
			$rate = "Премиум";
		}
	} elseif ($fuel_type == "gas") {
		if ($volume <= 200) {
			$rate = "Эконом";
		} elseif ($volume > 200 && $volume <= 700) {
			$rate = "Избранный";
		} elseif (700 < $volume) {
			$rate = "Премиум";
		}
	} elseif ($fuel_type == "diesel") {
		if ($volume <= 150) {
			$rate = "Эконом";
		} elseif ($volume > 150 && $volume <= 350) {
			$rate = "Избранный";
		} elseif (350 < $volume) {
			$rate = "Премиум";
		}
	}
	return $rate;
}

function get_rate_discount($rate) {
	if ($rate == 'Эконом') {
		$rate_discount = 0.03;
	} elseif ($rate == 'Избранный') {
		$rate_discount = 0.05;
	} elseif ($rate == 'Премиум') {
		$rate_discount = 0.07;
	}
	return $rate_discount;
}

function get_promo_discount($promo, $rate) {
	$promo_discount = intval($promo) / 100;
	if ($rate == 'Эконом' && ($promo == 20 || $promo == 50)) {
		$promo_discount = 0;
	} elseif ($rate == 'Избранный' && ($promo == 2 || $promo == 50)) {
		$promo_discount = 0;
	} elseif ($rate == 'Премиум' && ($promo == 2 || $promo == 5)) {
		$promo_discount = 0;
	}
	return $promo_discount;
}

function get_price_and_brand_list($fuel_type, $volume) {
	if (isset($fuel_type)) {
		$data = [];
		if ($fuel_type == 'gasoline') {
			$price = 500200;
			$available_brand_list = "rosneft,tatneft,lukoil";
			if (isset($volume)) {
				$data['rate'] = get_rate($fuel_type, $volume);
			}
		} elseif ($fuel_type == 'gas') {
			$price = 200100;
			$available_brand_list = "shell,gazprom,bashneft";
			if (isset($volume)) {
				$data['rate'] = get_rate($fuel_type, $volume);
			}
		} elseif ($fuel_type == 'diesel') {
			$price = 320700;
			$available_brand_list = "tatneft,lukoil";
			if (isset($volume)) {
				$data['rate'] = get_rate($fuel_type, $volume);
			}
		}
		$data['price'] = $price;
		$data['available_brand_list'] = $available_brand_list;
		return $data;
	}
}

if (isset($_POST['send_email'])) {
	$error_input_list = "";
	if ($_POST['INN'] == "" || !is_numeric($_POST['INN']) || strlen($_POST['INN']) != 12)  {
		if ($error_input_list != "") {
			$error_input_list = $error_input_list + ",";
		}
		$error_input_list = $error_input_list . "INN";
	}
	if ($_POST['phone'] == "" || strlen(preg_replace('/[^0-9]/', '', $_POST['phone'])) != 11 ) {
		if ($error_input_list != "") {
			$error_input_list = $error_input_list . ",";
		}
		$error_input_list = $error_input_list . "phone";
	}
	if ($_POST['email'] == "" || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
		if ($error_input_list != "") {
			$error_input_list = $error_input_list . ",";
		}
		$error_input_list = $error_input_list . "email";
	}
	if (!isset($_POST['agree'])) {
		if ($error_input_list != "") {
			$error_input_list = $error_input_list . ",";
		}
		$error_input_list = $error_input_list . "agree";
	}
	if ($error_input_list == "") {

		$fuel_type = $_POST['fuel-type'];
		$volume = $_POST['volume'];
		$price = get_price_and_brand_list($fuel_type, $volume)['price'];
		$rate = get_rate($fuel_type, $volume);
		$rate_discount = get_rate_discount($rate);
		$promo_discount = 0;
		if (isset($_POST['promo'])) {
			$promo_discount = get_promo_discount($_POST['promo'], $rate);
		}
		$total_discount = floatval($rate_discount) + floatval($promo_discount);
		$total_discount_percent = $total_discount * 100;
		$total_price_per_month = $price * $volume;
		$total_discount_in_rub_per_month = floatval($total_discount) * intval($total_price_per_month);
		$total_discount_in_rub_per_year = intval($total_discount_in_rub_per_month) * 12;


		$to      = $_POST['email'];
		$subject = 'Калькулятор тарифов';

		$email_message = "Регион: " . $_POST['select-region'] . ",\r\n";
		$email_message .= "Цена за тонну: " . $price . ",\r\n";
		$email_message .= "Прокачка: " . $volume . ",\r\n";
		$email_message .= "Тип топлива: " . $fuel_type . ",\r\n";
		$email_message .= "Бренд: " . $_POST['brand'] . ",\r\n";
		if (isset($_POST['additional_service'])) {
			$email_message .= "Дополнительные услуги: " . implode(", ", $_POST['additional_service']) . ",\r\n";
		}
		$email_message .= "Тариф: " . $rate . ",\r\n";
		if (isset($_POST['promo'])) {
			$email_message .= "Промо-акция: " . $_POST['promo'] . ",\r\n";
		}
		$email_message .= "Стоимость топлива в месяц: " . number_format($total_price_per_month, 0, '.', ' ') . ",\r\n";
		$email_message .= "Суммарная скидка %: " . $total_discount_percent . ",\r\n";
		$email_message .= "Экономия в месяц: " . number_format($total_discount_in_rub_per_month, 0, '.', ' ') . ",\r\n";
		$email_message .= "Экономия в год: " . number_format($total_discount_in_rub_per_year, 0, '.', ' ') . ".\r\n";

		$email_message .= "total_discount: " . $total_discount;

		$headers = 'From: <'.$_POST['email'].'>' . "\r\n";

		if (mail($to, $subject, $email_message, $headers)) {
			$result['success'] = "Сообщение успешно отправлено!";
		} else {
			$result['email_error'] = "Ошибка при отправке email";
		}
	} else {
		$result['error_input_list'] = $error_input_list;
	}
	echo json_encode($result);
} else {
	$result = [];
	$range_max = 0;
	$price = 0;
	$total_price = 0;
	$available_brand_list = "";
	$rate = "Эконом";
	$rate_discount = 0.03;
	$promo_discount = 0;

	if (isset($_POST['volume'])) {
		$volume = intval($_POST['volume']);
	}

	if (isset($_POST['select-region'])) {
		if ($_POST['select-region'] == 'region-1') {
			$range_max = 1200;
		} elseif ($_POST['select-region'] == 'region-2') {
			$range_max = 800;
		} elseif ($_POST['select-region'] == 'region-3') {
			$range_max = 500;
		}
		$result['range_max'] = $range_max;
	}

	if ($range_max < $volume) {
		$volume = intval($range_max);
	}

	$price = get_price_and_brand_list($_POST['fuel-type'], $volume)['price'];
	$result['price'] = $price;
	$result['available_brand_list'] = get_price_and_brand_list($_POST['fuel-type'], $volume)['available_brand_list'];

	if (isset($volume)) {
		$total_price_per_month = $price * $volume;
		$result['total_price_per_month'] = $total_price_per_month;
		$result['volume'] = $volume;
		$rate = get_rate($_POST['fuel-type'], $_POST['volume']);
		$result['rate'] = $rate;
		$rate_discount = get_rate_discount($rate);
		if (isset($_POST['promo'])) {
			$promo_discount = get_promo_discount($_POST['promo'], $rate);
		}

		$result['promo_discount'] = $promo_discount;

		$total_discount = $rate_discount + $promo_discount;
		$total_discount_in_rub_per_month = $total_discount * $total_price_per_month;
		$total_discount_in_rub_per_year = $total_discount_in_rub_per_month * 12;

		$price_per_month = $total_price_per_month - $total_discount_in_rub_per_month;
		$price_per_year = $total_price_per_month * 12 - $total_discount_in_rub_per_year;

		$result['total_discount_in_rub_per_month'] = $total_discount_in_rub_per_month;
		$result['total_discount_in_rub_per_year'] = $total_discount_in_rub_per_year;
	}

	if (isset($_POST['additional_service'])) {
		$result['additional_services'] = $_POST['additional_service'];
	}
	echo json_encode($result);
}