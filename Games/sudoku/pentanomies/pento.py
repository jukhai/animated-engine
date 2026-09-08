# Pentomino exact cover solver using Algorithm X (Dancing Links-free, simple recursion).
# Finds one tiling for a W x H rectangle using the 12 pentominoes exactly once.

from collections import defaultdict
from typing import List, Tuple, Dict, Set
import itertools
import sys

# Define the 12 pentomino base shapes (using classic letter names)
# Each shape is a set of (x, y) squares with (0,0) included; size 5 each.
# Coordinates are chosen for simple canonical bases.
PENT_BASES: Dict[str, Set[Tuple[int, int]]] = {
    "F": {(0,1),(1,0),(1,1),(1,2),(2,2)},
    "I": {(0,0),(0,1),(0,2),(0,3),(0,4)},
    "L": {(0,0),(0,1),(0,2),(0,3),(1,3)},
    "P": {(0,0),(0,1),(0,2),(1,0),(1,1)},
    "N": {(0,0),(0,1),(1,1),(1,2),(1,3)},  # like a zig with offset
    "T": {(0,0),(1,0),(2,0),(1,1),(1,2)},
    "U": {(0,0),(0,1),(1,1),(2,0),(2,1)},
    "V": {(0,0),(0,1),(0,2),(1,2),(2,2)},
    "W": {(0,0),(1,0),(1,1),(2,1),(2,2)},
    "X": {(1,0),(0,1),(1,1),(2,1),(1,2)},
    "Y": {(0,0),(0,1),(0,2),(0,3),(1,1)},
    "Z": {(0,0),(1,0),(1,1),(1,2),(2,2)},
}

def normalize(shape: Set[Tuple[int,int]]) -> Tuple[Tuple[int,int], ...]:
    """Translate shape so that min x and min y are zero; return sorted tuple for hashing."""
    minx = min(x for x, _ in shape)
    miny = min(y for _, y in shape)
    translated = sorted((x - minx, y - miny) for x, y in shape)
    return tuple(translated)

def rotate(shape: Set[Tuple[int,int]]) -> Set[Tuple[int,int]]:
    """Rotate 90° clockwise around origin: (x, y) -> (y, -x)."""
    return {(y, -x) for x, y in shape}

def reflect(shape: Set[Tuple[int,int]]) -> Set[Tuple[int,int]]:
    """Reflect across y-axis: (x, y) -> (-x, y)."""
    return {(-x, y) for x, y in shape}

def orientations(base: Set[Tuple[int,int]]) -> List[Tuple[Tuple[int,int], ...]]:
    """Generate all unique orientations (rotations/reflections) normalized."""
    seen = set()
    variants = []
    curr = base
    for _ in range(4):
        for refl in [False, True]:
            s = curr if not refl else reflect(curr)
            key = normalize(s)
            if key not in seen:
                seen.add(key)
                variants.append(key)
        curr = rotate(curr)
    return variants

def all_placements(W: int, H: int) -> Tuple[List[Tuple[str, Tuple[int, ...]]], Dict[Tuple[int,int], int]]:
    """Generate placements for all pentominoes on a W x H board.
       Returns rows (pent name, covered cell indices) and a mapping from (x,y) to column index."""
    # Map board cells to column indices [0..W*H-1]
    cell_to_col = {(x, y): y*W + x for y in range(H) for x in range(W)}
    rows = []
    for name, base in PENT_BASES.items():
        for ori in orientations(base):
            # width and height of this orientation
            maxx = max(x for x, y in ori)
            maxy = max(y for x, y in ori)
            for ox in range(W - maxx):
                for oy in range(H - maxy):
                    cells = []
                    fits = True
                    for x, y in ori:
                        X, Y = x + ox, y + oy
                        if not (0 <= X < W and 0 <= Y < H):
                            fits = False
                            break
                        cells.append(cell_to_col[(X, Y)])
                    if fits:
                        rows.append((name, tuple(sorted(cells))))
    return rows, cell_to_col

def build_exact_cover(rows: List[Tuple[str, Tuple[int, ...]]], W: int, H: int):
    """Exact cover with primary columns: board cells (W*H) and pentomino usage (12).
       Return structures for Algorithm X: columns -> rows, and row -> columns."""
    num_cells = W * H
    # Columns: 0..num_cells-1 for cells, then num_cells..num_cells+11 for each pentomino
    pent_names = sorted(PENT_BASES.keys())
    pent_to_col = {p: num_cells + i for i, p in enumerate(pent_names)}
    
    col_to_rows = defaultdict(list)
    row_to_cols = []
    for r_id, (name, cells) in enumerate(rows):
        cols = list(cells) + [pent_to_col[name]]
        row_to_cols.append(cols)
        for c in cols:
            col_to_rows[c].append(r_id)
    all_cols = set(range(num_cells + len(pent_names)))
    return all_cols, col_to_rows, row_to_cols, pent_to_col, pent_names

def algorithm_x(all_cols: Set[int], col_to_rows: Dict[int, List[int]], row_to_cols: List[List[int]], solution: List[int]):
    """Generator for solutions using Algorithm X (Knuth)."""
    if not all_cols:
        yield list(solution)
        return
    # choose column with fewest rows to branch efficiently
    c = min(all_cols, key=lambda col: len(col_to_rows[col]))
    if len(col_to_rows[c]) == 0:
        return
    rows_snapshot = list(col_to_rows[c])
    for r in rows_snapshot:
        solution.append(r)
        # columns to cover
        cols = row_to_cols[r]
        removed_cols = []
        removed_rows_per_col = {}
        # cover columns
        for col in cols:
            if col not in all_cols:
                continue
            all_cols.remove(col)
            removed_cols.append(col)
            removed_rows = col_to_rows[col]
            removed_rows_per_col[col] = removed_rows.copy()
            for rr in removed_rows:
                for cc in row_to_cols[rr]:
                    if rr in col_to_rows[cc]:
                        col_to_rows[cc].remove(rr)
        # recurse
        yield from algorithm_x(all_cols, col_to_rows, row_to_cols, solution)
        # uncover
        for col in reversed(removed_cols):
            for rr in removed_rows_per_col[col]:
                if rr not in col_to_rows[col]:
                    col_to_rows[col].append(rr)
            all_cols.add(col)
        solution.pop()

def solve_pentomino(W: int, H: int, first_only=True):
    if (W * H) != 60:
        raise ValueError("Pentomino rectangle must have area 60 (12 pieces × 5 squares).")
    placements, cell_to_col = all_placements(W, H)
    all_cols, col_to_rows, row_to_cols, pent_to_col, pent_names = build_exact_cover(placements, W, H)
    # Find one solution
    for sol in algorithm_x(set(all_cols), defaultdict(list, {k: v.copy() for k, v in col_to_rows.items()}), [c.copy() for c in row_to_cols], []):
        # Convert solution rows to board letters
        grid = [['.' for _ in range(W)] for __ in range(H)]
        for r_id in sol:
            name, cells = placements[r_id]
            for c in cells:
                # invert cell_to_col
                y, x = divmod(c, W)
                grid[y][x] = name
        return grid, sol  # first solution
    return None, None

def render_grid(grid: List[List[str]]) -> str:
    return "\n".join("".join(row) for row in grid)

# Try solving a 6x10 rectangle (classic)
W, H = 10, 6
grid, sol = solve_pentomino(W, H, first_only=True)
if grid is None:
    print("No solution found.")
else:
    ascii_board = render_grid(grid)
    print(f"One solution for {W}x{H} rectangle using 12 pentominoes:\n")
    print(ascii_board)
    # Save to file
    path = "/mnt/data/pentomino_{}x{}.txt".format(W, H)
    with open(path, "w", encoding="utf-8") as f:
        f.write(ascii_board)
    print("\nSaved to:", path)
