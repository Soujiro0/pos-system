<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display a listing of the products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('inventory');

        if ($request->has('q')) {
            $searchTerm = $request->query('q');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        $perPage = $request->input('per_page', 15);
        $products = $query->paginate((int)$perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:tbl_products,sku',
            'barcode' => 'nullable|string|unique:tbl_products,barcode',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url',
            'attributes' => 'nullable|array',
        ]);

        $product = $this->productService->createProduct($validatedData);

        return response()->json($product, 201);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|nullable|string|unique:tbl_products,sku,' . $product->id,
            'barcode' => 'sometimes|nullable|string|unique:tbl_products,barcode,' . $product->id,
            'price' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url',
            'attributes' => 'nullable|array',
        ]);

        $updatedProduct = $this->productService->updateProduct($product, $validatedData);

        return response()->json($updatedProduct);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->productService->deleteProduct($product);

        return response()->json(null, 204);
    }
}
