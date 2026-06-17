import PlantForm from "@/src/components/plantForm";

export default function AddPlantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        <header>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            ເພີ່ມສິນຄ້າໃໝ່
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ໃສ່ຂໍ້ມູນສິນຄ້າ ແລະ ບັນທຶກລົງສະຕ໋ອກ
          </p>
        </header>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-6">
          <PlantForm />
        </div>
      </div>
    </div>
  );
}
