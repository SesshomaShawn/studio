
import { getProducts } from "@/lib/actions";

type ProductTotalCountProps = {
    query?: string;
    category?: string;
}

export async function ProductTotalCount({ query, category }: ProductTotalCountProps) {
    // We only need the count, so we can fetch just 1 item to be efficient.
    const { totalCount } = await getProducts({ query, category, limit: 1, page: 1 });
    
    if (totalCount === 0) {
        return null;
    }

    return (
        <div className="text-sm text-muted-foreground">
            Hiển thị kết quả cho <span className="font-semibold text-foreground">{totalCount}</span> sản phẩm.
        </div>
    )
}
