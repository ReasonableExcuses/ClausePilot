from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple


class ExtractorStrategy(ABC):
    @abstractmethod
    def extract(
        self, contract_text: str, pages_data: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Executes information extraction on parsed contract text and pages.
        Returns:
            (parties_data, clauses_data, obligations_data)
        """
        pass
