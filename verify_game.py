from playwright.sync_api import sync_playwright

def verify_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open the file
        import os
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Check background color (approximate)
        bg_color = page.locator('#game-container').evaluate("el => getComputedStyle(el).backgroundColor")
        print(f"Background color: {bg_color}")

        # Check cards count
        cards = page.locator('.card')
        count = cards.count()
        print(f"Card count: {count}")
        assert count == 8, "Should have 8 cards"

        # Verify no pairs in rows
        # We need to peek at the image srcs
        srcs = []
        for i in range(count):
            # Click to flip (temporarily, or just inspect DOM if images are already there but hidden)
            # The images are in .card-back img
            src = cards.nth(i).locator('.card-back img').get_attribute('src')
            srcs.append(src)

        print("Card Layout:")
        for i in range(0, 8, 2):
            print(f"Row {i//2 + 1}: {srcs[i]} - {srcs[i+1]}")
            assert srcs[i] != srcs[i+1], f"Row {i//2 + 1} has matching pair!"

        print("Verification Successful: No pairs in rows.")
        browser.close()

if __name__ == "__main__":
    verify_game()
