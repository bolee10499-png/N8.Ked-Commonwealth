from dataclasses import dataclass, field
from typing import List, Optional
import time

@dataclass
class BotStateBlock:
    """
    Represents a single bot state block in the chain.
    state: List of bot state values.
    action: List of bot action values.
    sync: List of bot sync values.
    timestamp: Creation time of the block.
    block_id: Sequential ID of the block in the chain.
    previous_hash: Simple hash of the previous block's state and timestamp.
    """
    state: List[int] = field(default_factory=lambda: [0]*7)
    action: List[int] = field(default_factory=lambda: [0]*7)
    sync: List[int] = field(default_factory=lambda: [0]*7)
    timestamp: float = field(default_factory=time.time)
    block_id: Optional[int] = None
    previous_hash: Optional[str] = None

class BotStateChain:
    """
    Manages the sequence of bot state blocks.
    """
    def __init__(self):
        self.chain: List[BotStateBlock] = []

    def add_block(self, block: BotStateBlock):
        """
        Appends a new block to the chain after assigning metadata.
        """
        block.block_id = len(self.chain)
        block.previous_hash = self._get_last_hash()
        self.chain.append(block)

    def get_latest_state(self) -> List[int]:
        """
        Returns the state of the latest block, or default if empty.
        """
        return self.chain[-1].state if self.chain else [0]*7

    def _get_last_hash(self) -> Optional[str]:
        """
        Returns a simple hash of the last block, if any.
        """
        if not self.chain:
            return None
        last_block = self.chain[-1]
        return str(hash(str(last_block.state) + str(last_block.timestamp)))
