Feature: Ecommerce shopping application

Scenario: Place an order and verify it in order history
    Given A login to ecommerce application
    When A customer search for products and add to the cart
    Then Customer can go to cart and place the order
    Then Customer gets order ID
    Then validate the orderID with OrderHistory