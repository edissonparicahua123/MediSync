import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pill, Plus, Search, AlertTriangle, Loader2, Edit, Trash2 } from 'lucide-react'
import { pharmacyAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import MedicationModal from '@/components/modals/MedicationModal'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PharmacyPage() {
    const [medications, setMedications] = useState<any[]>([])
    const [lowStock, setLowStock] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedMedication, setSelectedMedication] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [medsRes, lowStockRes] = await Promise.all([
                pharmacyAPI.getMedications(),
                pharmacyAPI.getLowStock()
            ])
            setMedications(medsRes.data.data || [])
            setLowStock(lowStockRes.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load pharmacy data',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await pharmacyAPI.deleteMedication(deleteId)
            toast({
                title: 'Success',
                description: 'Medication deleted successfully',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete medication',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Pill className="h-8 w-8" />
                        Pharmacy
                    </h1>
                    <p className="text-muted-foreground mt-1">Medication inventory and management</p>
                </div>
                <Button onClick={() => {
                    setSelectedMedication(null)
                    setModalOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                </Button>
            </div>

            {lowStock.length > 0 && (
                <Card className="p-4 mb-6 border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="font-semibold">
                            {lowStock.length} medication(s) running low on stock
                        </p>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Medications</p>
                    <p className="text-2xl font-bold">{medications.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                        {medications.filter(m => m.isActive).length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-600">{lowStock.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">
                        {new Set(medications.map(m => m.category)).size}
                    </p>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search medications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Generic Name</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-left p-3">Stock</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                        No medications found
                                    </td>
                                </tr>
                            ) : (
                                filteredMedications.map((medication) => (
                                    <tr key={medication.id} className="border-b hover:bg-accent">
                                        <td className="p-3 font-medium">{medication.name}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {medication.genericName || 'N/A'}
                                        </td>
                                        <td className="p-3">{medication.category || 'N/A'}</td>
                                        <td className="p-3">
                                            {medication.stock?.[0]?.quantity || 0} units
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${medication.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {medication.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedMedication(medication)
                                                        setModalOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteId(medication.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <MedicationModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                medication={selectedMedication}
                onSuccess={loadData}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the medication from the inventory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
