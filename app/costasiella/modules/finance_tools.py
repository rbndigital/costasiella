

def display_float_as_amount(amount):
    from constance import config

    return ' '.join([config.CURRENCY_SYMBOL, format(amount, '.2f')])
