# Test for blockchain module
from core.blockchain import BotStateBlock, BotStateChain

def test_block_addition():
    chain = BotStateChain()
    block = BotStateBlock()
    chain.add_block(block)
    assert chain.get_latest_state() == block.state
