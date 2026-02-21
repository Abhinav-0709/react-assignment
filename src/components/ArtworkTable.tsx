import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

interface ApiResponse {
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    };
    data: Artwork[];
}

export default function ArtworkTable() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 12,
        page: 1,
    });


    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [unfetchedSelectedIndices, setUnfetchedSelectedIndices] = useState<Set<number>>(new Set());
    const overlayPanelRef = useRef<OverlayPanel>(null);
    const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [lazyParams]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${lazyParams.page}&limit=${lazyParams.rows}`);
            const data: ApiResponse = await response.json();

            setTotalRecords(data.pagination.total);
            const fetchedData = data.data;
            setArtworks(fetchedData);

            const newSelectedIds = new Set(selectedIds);
            let updatedUnfetchedIndices = new Set(unfetchedSelectedIndices);
            let hasChanges = false;

            fetchedData.forEach((artwork, index) => {
                const globalIndex = lazyParams.first + index;
                if (updatedUnfetchedIndices.has(globalIndex)) {
                    newSelectedIds.add(artwork.id);
                    updatedUnfetchedIndices.delete(globalIndex);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setSelectedIds(newSelectedIds);
                setUnfetchedSelectedIndices(updatedUnfetchedIndices);
            }

        } catch (error) {
            console.error("Failed to fetch artworks", error);
        } finally {
            setLoading(false);
        }
    };

    const onPage = (event: DataTableStateEvent) => {
        setLazyParams({
            first: event.first,
            rows: event.rows,
            page: (event.page ?? 0) + 1,
        });
    };

    // Fully custom selection management, no need for native PrimeReact selection array

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectedIds(prev => {
            const newSelectedIds = new Set(prev);
            if (isChecked) {
                artworks.forEach(a => newSelectedIds.add(a.id));
            } else {
                artworks.forEach(a => newSelectedIds.delete(a.id));
            }
            return newSelectedIds;
        });
    };

    const isCurrentPageAllSelected = artworks.length > 0 && artworks.every(a => selectedIds.has(a.id));

    const handleCustomSubmit = () => {
        if (!rowsToSelect || rowsToSelect <= 0) return;

        const newSelectedIds = new Set(selectedIds);
        const newUnfetched = new Set(unfetchedSelectedIndices);

        for (let i = 0; i < rowsToSelect; i++) {
            if (i >= lazyParams.first && i < lazyParams.first + artworks.length) {
                const localIndex = i - lazyParams.first;
                const artwork = artworks[localIndex];
                if (artwork) {
                    newSelectedIds.add(artwork.id);
                }
            } else {
                newUnfetched.add(i);
            }
        }

        setSelectedIds(newSelectedIds);
        setUnfetchedSelectedIndices(newUnfetched);

        overlayPanelRef.current?.hide();
    };

    const tableData = artworks.map(artwork => ({
        ...artwork,
        _selected: selectedIds.has(artwork.id)
    }));

    return (
        <div className="card p-4 mx-auto max-w-7xl bg-white shadow-xl rounded-2xl my-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        Artworks Gallery
                        {(selectedIds.size > 0 || unfetchedSelectedIndices.size > 0) && (
                            <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200 shadow-sm">
                                {selectedIds.size + unfetchedSelectedIndices.size} selected
                            </span>
                        )}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Art Institute of Chicago API</p>
                </div>
            </div>

            <DataTable
                value={tableData}
                lazy
                paginator
                first={lazyParams.first}
                rows={lazyParams.rows}
                totalRecords={totalRecords}
                onPage={onPage}
                loading={loading}
                dataKey="id"
                tableStyle={{ minWidth: '50rem' }}
                className="p-datatable-sm"
                rowHover
                stripedRows
            >
                <Column
                    headerStyle={{ width: '4rem' }}
                    bodyStyle={{ textAlign: 'center' }}
                    body={(rowData: Artwork & { _selected: boolean }) => {
                        const isSelected = rowData._selected;
                        return (
                            <div className="flex items-center justify-center relative">
                                <input 
                                    type="checkbox"
                                    className="w-5 h-5 rounded cursor-pointer p-checkbox-box p-component"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSelectedIds(prev => {
                                            const newIds = new Set(prev);
                                            if (checked) newIds.add(rowData.id);
                                            else newIds.delete(rowData.id);
                                            return newIds;
                                        });
                                    }}
                                    style={{
                                        border: '2px solid #94a3b8', 
                                        appearance: 'none', 
                                        backgroundColor: isSelected ? '#3b82f6' : 'white',
                                        display: 'grid',
                                        placeContent: 'center',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                                {isSelected && (
                                    <svg className="absolute w-3 h-3 text-white pointer-events-none" style={{ zIndex: 2 }} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                        );
                    }}
                    header={
                        <div className="flex items-center justify-center relative gap-2">
                            <div className="flex items-center justify-center relative">
                                <input 
                                    type="checkbox"
                                    className="w-5 h-5 rounded cursor-pointer p-checkbox-box p-component"
                                    checked={isCurrentPageAllSelected}
                                    title="Select All Current Page"
                                    ref={input => {
                                        if (input) {
                                          input.indeterminate = isCurrentPageAllSelected ? false : (artworks.some(a => selectedIds.has(a.id)));
                                        }
                                    }}
                                    onChange={(e) => handleSelectAllOnPage(e)}
                                    style={{
                                        border: '2px solid #94a3b8', 
                                        appearance: 'none', 
                                        backgroundColor: isCurrentPageAllSelected ? '#3b82f6' : 'white',
                                        display: 'grid',
                                        placeContent: 'center',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                                {isCurrentPageAllSelected && (
                                    <svg className="absolute w-3 h-3 text-white pointer-events-none" style={{ zIndex: 2 }} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <Button
                                icon="pi pi-chevron-down"
                                size="small"
                                rounded
                                text
                                severity="secondary"
                                onClick={(e) => overlayPanelRef.current?.toggle(e)}
                                aria-label="Select custom rows"
                                tooltip="Custom Row Selection"
                                tooltipOptions={{ position: 'top' }}
                                style={{ marginLeft: '-0.25rem' }}
                            />
                        </div>
                    }
                ></Column>
                <Column field="title" header="Title" style={{ width: '25%' }}></Column>
                <Column field="place_of_origin" header="Place of Origin" style={{ width: '15%' }}></Column>
                <Column field="artist_display" header="Artist" style={{ width: '20%' }}></Column>
                <Column field="inscriptions" header="Inscriptions" style={{ width: '20%' }}></Column>
                <Column field="date_start" header="Start Date" style={{ width: '10%' }}></Column>
                <Column field="date_end" header="End Date" style={{ width: '10%' }}></Column>
            </DataTable>

            <OverlayPanel ref={overlayPanelRef} className="p-4 shadow-lg rounded-xl">
                <div className="flex flex-col gap-3 min-w-[16rem]">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Select Rows</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <InputNumber
                            value={rowsToSelect}
                            onValueChange={(e) => setRowsToSelect(e.value ?? null)}
                            placeholder="Number of rows"
                            className="flex-1"
                            min={1}
                            max={totalRecords}
                        />
                        <Button label="Submit" onClick={handleCustomSubmit} size="small" className="shrink-0" />
                    </div>
                </div>
            </OverlayPanel>
        </div>
    );
}
