class PorosityAnalyzer:
    """Analyzes and manages porosity in spatial structures."""
    def __init__(self):
        self.porous_zones = []
    def add_porous_zone(self, zone, permeability):
        self.porous_zones.append({
            "zone": zone,
            "permeability": permeability
        })
    def get_porosity_map(self):
        return self.porous_zones
