# Alugard Puzzle

A premium browser puzzle game built with React, TypeScript, Vite, and the `alugard-drop` drag-and-drop library.

The game breaks breathtaking digital art into **octagon-shaped pieces** and lets the player assemble them in a highly interactive, drag-and-drop workspace.

## How It Works: The Tessellation Engine

The math behind rendering arbitrary shaped puzzle pieces using DOM elements is the secret sauce of this project. Here's a breakdown of how the **Octagon Tessellation Engine** works, and how you can use these exact same principles to build puzzle games with Triangles, Hexagons, or even custom chaotic shapes!

### 1. The Core Problem: Why "4.8.8"?
Tessellation is the tiling of a plane using one or more geometric shapes with no overlaps and no gaps.
There are only **3 regular polygons** that can tile a plane perfectly by themselves:
*   **Squares** (4.4.4.4)
*   **Equilateral Triangles** (3.3.3.3.3.3)
*   **Regular Hexagons** (6.6.6)

An **Octagon** cannot tile a plane by itself! If you put octagons side-by-side, you are left with little diamond/square-shaped gaps. This is known mathematically as the **4.8.8 Semi-Regular Tessellation** (meaning each vertex is surrounded by one square "4" and two octagons "8"). 

In our game, we mapped out this exact grid. The squares are just invisible "gaps" on our board, and the octagons are our puzzle pieces!

### 2. The Math of Our Octagon Grid (s, d, W)
To draw an octagon using CSS `clip-path` and position it on the screen, we only need a single input variable: **`s`** (the side length of the octagon).

From `s`, we derived everything else using Pythagorean geometry:

*   **`s` (Side Length):** The length of the straight flat edges.
*   **`d` (Diagonal Cut):** The horizontal/vertical space taken up by the angled corners. Because it forms a 45-degree right triangle with hypotenuse `s`, we use Pythagoras: `s² = d² + d² ⟹ s² = 2d² ⟹ d = s * √(2) / 2`
*   **`W` (Bounding Box):** If you draw a tight square box around the octagon, its total width and height is `W = s + 2d` (a left cut `d`, a center flat edge `s`, and a right cut `d`).

#### How we plot pieces on the board:
If you put an octagon down, the very next octagon horizontally doesn't start `W` pixels away. It shares a slanted edge, so it mathematically steps exactly **`s + d`** pixels over! 
In `src/utils/octagonGrid.ts`, we refer to this as the `step`:
```typescript
const step = s + d;
const originX = col * step;
const originY = row * step;
```
This single `step` formula is what perfectly locks the jigsaw pieces together without gaps.

### 3. The `clip-path` Illusion
We actually render standard square `<div>` elements of size `W` by `W`. 
To make them look like octagons, we apply CSS `clip-path` using 8 coordinate points. Since our top-left corner is `(0,0)`, the points around the edge of our `W` by `W` box are:
1. Top-Left cut: `(d, 0)`
2. Top-Right cut: `(d+s, 0)`
3. Right-Top edge: `(W, d)`
4. Right-Bottom edge: `(W, d+s)`
5. Bottom-Right cut: `(d+s, W)`
6. Bottom-Left cut: `(d, W)`
7. Left-Bottom edge: `(0, d+s)`
8. Left-Top edge: `(0, d)`

### 4. The Image Offset Trick
If every piece is just an empty octagon `div`, how does it show its specific chunk of the puzzle image?
We set the `background-image` of EVERY piece to the same full-size picture! However, we use `background-position` to shift the image *up and to the left* by an amount exactly matching the piece's grid `originX` and `originY`. 

It's like moving a small octagonal magnifying glass over a giant poster. The `clip-path` acts as the glass's rim, and the `background-position` ensures you're looking at the correct coordinate of the poster.

***

## 🚀 How to build other polygon puzzles

If you want to build a **Hexagon** or **Triangle** version of this game, the architecture remains 100% identical! You only need to change three formulas in your engine:

#### Example: Building a Hexagon (Honeycomb) Puzzle
A regular hexagon (6.6.6 tessellation) is actually easier than an octagon because you don't have gaps!
Using `s` as your side length:

1. **Math Variables:**
   *  `d` (horizontal indent of the pointy part) = `s / 2`
   *  `h` (half height of the hexagon) = `s * √(3) / 2`
   *  `W` (Bounding Box Width) = `s + 2d` (which equals `2s`)
   *  `H` (Bounding Box Height) = `2h`
2. ** The Grid Step:**
   Hexagons interlock in a staggered brick pattern. 
   *  Your horizontal spacing (`stepX`) = `s + d`
   *  Your vertical spacing (`stepY`) = `h`
   *  *Note: Every odd column must be shifted down by exactly `h`!*
3. ** The 6-Point `clip-path`:**
   ```css
   clip-path: polygon(d 0, d+s 0, W h, d+s H, d H, 0 h);
   ```

#### Steps to implement a new shape:
1. Draw the shape on paper inside a rectangular bounding box.
2. Label `W` (Width) and `H` (Height).
3. Express all your corner `(x, y)` points in relation to `0`, `W`, `H`, and your shape's angles (Basic trigonometry: `Math.sin`/`Math.cos`).
4. Look at two adjacent pieces and figure out your horizontal and vertical `step` distances.
5. Update `buildClipPath` and the `originX` / `originY` multipliers in `buildGrid`. 

Everything else—the `alugard-drop` drag-and-drop, the GameState, the win logic, and the background-image scaling—requires **zero changes**!

## Getting Started

1. Ensure the `alugard-drop` drag-and-drop library is built and available.
2. Run `bun install` to grab dependencies.
3. Run `bun run dev` to start the game server.
