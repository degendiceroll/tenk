import os

if __name__ == "__main__":
    os.environ["NEAR_ENV"] = "mainnet"
    os.system("echo $NEAR_ENV")
    os.system("near call nmkmint.near nft_metadata --accountId flyingsaucer00.near")