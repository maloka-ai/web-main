import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { SaleItem, salesService } from '@/services/salesService';
import { formatCurrency } from '@/utils/format';

interface Params {
  id_venda: number;
}
export const RenderDetailsPanelSales = ({ id_venda }: Params) => {
  const [products, setProducts] = useState<SaleItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    salesService
      .getSaleItems(id_venda)
      .then((res) => setProducts(res))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Buscando...</div>;
  }

  if (!products?.length) {
    return <div>Nenhum item encontrado</div>;
  }

  return (
    <TableContainer>
      <Table style={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell>Qtd</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Desconto</TableCell>
            <TableCell>Acréscimo</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id_venda_item}>
              <TableCell>{p.nome_produto}</TableCell>
              <TableCell>{p.quantidade}</TableCell>
              <TableCell>{formatCurrency(p.preco_bruto)}</TableCell>
              <TableCell>{formatCurrency(p.desconto)}</TableCell>
              <TableCell>{formatCurrency(p.acrescimo)}</TableCell>
              <TableCell>{formatCurrency(p.total_item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
