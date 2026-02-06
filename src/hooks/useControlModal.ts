import { useState } from 'react';

export function useControlModal() {
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const handleOpenModalEdit = () => setOpenModalEdit(true);
  const handleCloseModalEdit = () => setOpenModalEdit(false);

  return [openModalEdit, handleOpenModalEdit, handleCloseModalEdit] as const;
}
