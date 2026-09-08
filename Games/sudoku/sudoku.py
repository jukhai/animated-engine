import random

# Sudoku size
N = 9
BOX = 3

def is_safe(board, row, col, num):
    # Check row and column
    for i in range(N):
        if board[row][i] == num or board[i][col] == num:
            return False

    # Check 3x3 box
    start_row, start_col = row - row % BOX, col - col % BOX
    for i in range(BOX):
        for j in range(BOX):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def solve_sudoku(board):
    for row in range(N):
        for col in range(N):
            if board[row][col] == 0:
                nums = list(range(1, N+1))
                random.shuffle(nums)
                for num in nums:
                    if is_safe(board, row, col, num):
                        board[row][col] = num
                        if solve_sudoku(board):
                            return True
                        board[row][col] = 0
                return False
    return True

def generate_full_board():
    board = [[0 for _ in range(N)] for _ in range(N)]
    solve_sudoku(board)
    return board

def remove_cells(board, num_remove=40):
    removed = 0
    while removed < num_remove:
        row = random.randint(0, N-1)
        col = random.randint(0, N-1)
        if board[row][col] != 0:
            board[row][col] = 0
            removed += 1
    return board

def print_board(board):
    for i in range(N):
        row = ''
        for j in range(N):
            val = board[i][j]
            row += f"{val if val != 0 else '.'} "
            if (j + 1) % BOX == 0 and j < N - 1:
                row += "| "
        print(row)
        if (i + 1) % BOX == 0 and i < N - 1:
            print("-" * 21)

# --- Generate puzzle ---
full_board = generate_full_board()
puzzle = remove_cells([row[:] for row in full_board], num_remove=40)  # Change 40 for more/less blanks

print("Generated Sudoku Puzzle:")
print_board(puzzle)

print("\nSolution:")
print_board(full_board)
