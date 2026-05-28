import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { DollarSign, Smartphone } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BD_DIVISIONS: Record<string, string[]> = {
    Dhaka: [
        'Dhaka',
        'Gazipur',
        'Narayanganj',
        'Tangail',
        'Faridpur',
        'Manikganj',
        'Munshiganj',
        'Rajbari',
        'Shariatpur',
        'Kishoreganj',
        'Narsingdi',
        'Madaripur',
        'Gopalganj',
        'Netrokona',
    ],
    Chattogram: [
        'Chattogram',
        "Cox's Bazar",
        'Cumilla',
        'Feni',
        'Brahmanbaria',
        'Noakhali',
        'Chandpur',
        'Lakshmipur',
        'Bandarban',
        'Rangamati',
        'Khagrachhari',
    ],
    Rajshahi: [
        'Rajshahi',
        'Pabna',
        'Sirajganj',
        'Natore',
        'Naogaon',
        'Chapainawabganj',
        'Joypurhat',
        'Bogura',
    ],
    Khulna: [
        'Khulna',
        'Jashore',
        'Satkhira',
        'Bagerhat',
        'Narail',
        'Magura',
        'Jhenaidah',
        'Meherpur',
        'Chuadanga',
        'Kushtia',
    ],
    Barishal: [
        'Barishal',
        'Bhola',
        'Patuakhali',
        'Pirojpur',
        'Jhalokathi',
        'Barguna',
    ],
    Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    Rangpur: [
        'Rangpur',
        'Dinajpur',
        'Gaibandha',
        'Kurigram',
        'Lalmonirhat',
        'Nilphamari',
        'Panchagarh',
        'Thakurgaon',
    ],
    Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const BD_UPAZILLAS: Record<string, string[]> = {
    // Dhaka Division
    Dhaka: [
        'Dhaka Sadar',
        'Savar',
        'Keraniganj',
        'Nawabganj',
        'Dohar',
        'Dhamrai',
    ],
    Gazipur: ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Kaliganj', 'Sreepur'],
    Narayanganj: [
        'Narayanganj Sadar',
        'Araihazar',
        'Bandar',
        'Rupganj',
        'Sonargaon',
    ],
    Tangail: [
        'Tangail Sadar',
        'Basail',
        'Bhuapur',
        'Delduar',
        'Dhanbari',
        'Ghatail',
        'Gopalpur',
        'Kalihati',
        'Madhupur',
        'Mirzapur',
        'Nagarpur',
        'Sakhipur',
    ],
    Faridpur: [
        'Faridpur Sadar',
        'Alfadanga',
        'Bhanga',
        'Boalmari',
        'Char Bhadrasan',
        'Madhukhali',
        'Nagarkanda',
        'Sadarpur',
        'Saltha',
    ],
    Manikganj: [
        'Manikganj Sadar',
        'Daulatpur',
        'Ghior',
        'Harirampur',
        'Saturia',
        'Shivalaya',
        'Singair',
    ],
    Munshiganj: [
        'Munshiganj Sadar',
        'Gazaria',
        'Lohajang',
        'Sirajdikhan',
        'Sreenagar',
        'Tongibari',
    ],
    Rajbari: [
        'Rajbari Sadar',
        'Baliakandi',
        'Goalandaghat',
        'Kalukhali',
        'Pangsha',
    ],
    Shariatpur: [
        'Shariatpur Sadar',
        'Bhedarganj',
        'Damudya',
        'Gosairhat',
        'Naria',
        'Zajira',
    ],
    Kishoreganj: [
        'Kishoreganj Sadar',
        'Austagram',
        'Bajitpur',
        'Bhairab',
        'Hossainpur',
        'Itna',
        'Karimganj',
        'Katiadi',
        'Kuliarchar',
        'Mithamain',
        'Nikli',
        'Pakundia',
        'Tarail',
    ],
    Narsingdi: [
        'Narsingdi Sadar',
        'Belabo',
        'Monohardi',
        'Palash',
        'Raipura',
        'Shibpur',
    ],
    Madaripur: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'],
    Gopalganj: [
        'Gopalganj Sadar',
        'Kashiani',
        'Kotalipara',
        'Muksudpur',
        'Tungipara',
    ],
    Netrokona: [
        'Netrokona Sadar',
        'Atpara',
        'Barhatta',
        'Durgapur',
        'Kalmakanda',
        'Kendua',
        'Khaliajuri',
        'Madan',
        'Mohanganj',
        'Purbadhala',
    ],
    // Chattogram Division
    Chattogram: [
        'Chattogram Sadar',
        'Anwara',
        'Banshkhali',
        'Boalkhali',
        'Chandanaish',
        'Fatikchhari',
        'Hathazari',
        'Karnaphuli',
        'Lohagara',
        'Mirsharai',
        'Patiya',
        'Rangunia',
        'Raozan',
        'Sandwip',
        'Satkania',
        'Sitakunda',
    ],
    "Cox's Bazar": [
        "Cox's Bazar Sadar",
        'Chakaria',
        'Kutubdia',
        'Maheshkhali',
        'Pekua',
        'Ramu',
        'Teknaf',
        'Ukhia',
    ],
    Cumilla: [
        'Cumilla Sadar',
        'Barura',
        'Brahmanpara',
        'Burichang',
        'Chandina',
        'Chauddagram',
        'Cumilla Sadar South',
        'Daudkandi',
        'Debidwar',
        'Homna',
        'Laksam',
        'Lalmai',
        'Meghna',
        'Monohorgonj',
        'Muradnagar',
        'Nangalkot',
        'Titas',
    ],
    Feni: [
        'Feni Sadar',
        'Chhagalnaiya',
        'Daganbhuiyan',
        'Fulgazi',
        'Parshuram',
        'Sonagazi',
    ],
    Brahmanbaria: [
        'Brahmanbaria Sadar',
        'Akhaura',
        'Ashuganj',
        'Banchharampur',
        'Kasba',
        'Nabinagar',
        'Nasirnagar',
        'Sarail',
    ],
    Noakhali: [
        'Noakhali Sadar',
        'Begumganj',
        'Chatkhil',
        'Companiganj',
        'Hatiya',
        'Kabirhat',
        'Senbagh',
        'Sonaimuri',
        'Subarnachar',
    ],
    Chandpur: [
        'Chandpur Sadar',
        'Faridganj',
        'Haimchar',
        'Haziganj',
        'Kachua',
        'Matlab Dakshin',
        'Matlab Uttar',
        'Shahrasti',
    ],
    Lakshmipur: [
        'Lakshmipur Sadar',
        'Kamalnagar',
        'Ramganj',
        'Ramgati',
        'Roypur',
    ],
    Bandarban: [
        'Bandarban Sadar',
        'Ali Kadam',
        'Lama',
        'Naikhongchhari',
        'Rowangchhari',
        'Ruma',
        'Thanchi',
    ],
    Rangamati: [
        'Rangamati Sadar',
        'Bagaichhari',
        'Barkal',
        'Belaichhari',
        'Juraichhari',
        'Kaptai',
        'Kawkhali',
        'Langadu',
        'Naniarchar',
        'Rajasthali',
    ],
    Khagrachhari: [
        'Khagrachhari Sadar',
        'Dighinala',
        'Lakshmichhari',
        'Mahalchhari',
        'Manikchhari',
        'Matiranga',
        'Panchhari',
        'Ramgarh',
    ],
    // Rajshahi Division
    Rajshahi: [
        'Rajshahi Sadar',
        'Bagha',
        'Bagmara',
        'Charghat',
        'Durgapur',
        'Godagari',
        'Mohanpur',
        'Paba',
        'Puthia',
        'Tanore',
    ],
    Pabna: [
        'Pabna Sadar',
        'Atgharia',
        'Bera',
        'Bhangura',
        'Chatmohar',
        'Faridpur',
        'Ishwardi',
        'Santhia',
        'Sujanagar',
    ],
    Sirajganj: [
        'Sirajganj Sadar',
        'Belkuchi',
        'Chauhali',
        'Enayetpur',
        'Kamarkhanda',
        'Kazipur',
        'Raiganj',
        'Shahjadpur',
        'Tarash',
        'Ullahpara',
    ],
    Natore: [
        'Natore Sadar',
        'Bagatipara',
        'Baraigram',
        'Gurudaspur',
        'Lalpur',
        'Singra',
    ],
    Naogaon: [
        'Naogaon Sadar',
        'Atrai',
        'Badalgachhi',
        'Dhamoirhat',
        'Mahadebpur',
        'Manda',
        'Niamatpur',
        'Patnitala',
        'Porsha',
        'Raninagar',
        'Sapahar',
    ],
    Chapainawabganj: [
        'Chapainawabganj Sadar',
        'Bholahat',
        'Gomastapur',
        'Nachole',
        'Shibganj',
    ],
    Joypurhat: ['Joypurhat Sadar', 'Akkelpur', 'Khetlal', 'Panchbibi', 'Kalai'],
    Bogura: [
        'Bogura Sadar',
        'Adamdighi',
        'Dhunot',
        'Dhupchanchia',
        'Gabtali',
        'Kahaloo',
        'Nandigram',
        'Sariakandi',
        'Shajahanpur',
        'Sherpur',
        'Shibganj',
        'Sonatala',
    ],
    // Khulna Division
    Khulna: [
        'Khulna Sadar',
        'Batiaghata',
        'Dacope',
        'Daulatpur',
        'Dighalia',
        'Dumuria',
        'Fultala',
        'Koyra',
        'Paikgachha',
        'Rupsha',
        'Terokhada',
    ],
    Jashore: [
        'Jashore Sadar',
        'Abhaynagar',
        'Bagherpara',
        'Chaugachha',
        'Jhikargachha',
        'Keshabpur',
        'Manirampur',
        'Sharsha',
    ],
    Satkhira: [
        'Satkhira Sadar',
        'Assasuni',
        'Debhata',
        'Kalaroa',
        'Kaliganj',
        'Shyamnagar',
        'Tala',
    ],
    Bagerhat: [
        'Bagerhat Sadar',
        'Chitalmari',
        'Fakirhat',
        'Kachua',
        'Mollahat',
        'Mongla',
        'Morrelganj',
        'Rampal',
        'Sarankhola',
    ],
    Narail: ['Narail Sadar', 'Kalia', 'Lohagara'],
    Magura: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
    Jhenaidah: [
        'Jhenaidah Sadar',
        'Harinakunda',
        'Kaliganj',
        'Kotchandpur',
        'Maheshpur',
        'Shailkupa',
    ],
    Meherpur: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'],
    Chuadanga: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'],
    Kushtia: [
        'Kushtia Sadar',
        'Bheramara',
        'Daulatpur',
        'Khoksa',
        'Kumarkhali',
        'Mirpur',
    ],
    // Barishal Division
    Barishal: [
        'Barishal Sadar',
        'Agailjhara',
        'Babuganj',
        'Bakerganj',
        'Banaripara',
        'Gauranadi',
        'Hizla',
        'Mehendiganj',
        'Muladi',
        'Wazirpur',
    ],
    Bhola: [
        'Bhola Sadar',
        'Burhanuddin',
        'Char Fasson',
        'Daulatkhan',
        'Lalmohan',
        'Manpura',
        'Tazumuddin',
    ],
    Patuakhali: [
        'Patuakhali Sadar',
        'Bauphal',
        'Dashmina',
        'Dumki',
        'Galachipa',
        'Kalapara',
        'Mirza Ganj',
        'Rangabali',
    ],
    Pirojpur: [
        'Pirojpur Sadar',
        'Bhandaria',
        'Indurkani',
        'Kavkhali',
        'Mathbaria',
        'Nazirpur',
        'Zianagar',
    ],
    Jhalokathi: ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
    Barguna: [
        'Barguna Sadar',
        'Amtali',
        'Bamna',
        'Betagi',
        'Patharghata',
        'Taltali',
    ],
    // Sylhet Division
    Sylhet: [
        'Sylhet Sadar',
        'Balaganj',
        'Beanibazar',
        'Bishwanath',
        'Companiganj',
        'Dakshin Surma',
        'Fenchuganj',
        'Golapganj',
        'Gowainghat',
        'Jaintiapur',
        'Kanaighat',
        'Osmani Nagar',
        'Zakiganj',
    ],
    Moulvibazar: [
        'Moulvibazar Sadar',
        'Barlekha',
        'Juri',
        'Kamalganj',
        'Kulaura',
        'Rajnagar',
        'Sreemangal',
    ],
    Habiganj: [
        'Habiganj Sadar',
        'Ajmiriganj',
        'Bahubal',
        'Baniachong',
        'Chunarughat',
        'Lakhai',
        'Madhabpur',
        'Nabiganj',
        'Shaistaganj',
    ],
    Sunamganj: [
        'Sunamganj Sadar',
        'Bishwamvarpur',
        'Chhatak',
        'Derai',
        'Dharampasha',
        'Doarabazar',
        'Jagannathpur',
        'Jamalganj',
        'Shalla',
        'South Sunamganj',
        'Tahirpur',
    ],
    // Rangpur Division
    Rangpur: [
        'Rangpur Sadar',
        'Badarganj',
        'Gangachhara',
        'Kaunia',
        'Mithapukur',
        'Pirgachha',
        'Pirganj',
        'Taraganj',
    ],
    Dinajpur: [
        'Dinajpur Sadar',
        'Birampur',
        'Birol',
        'Bochaganj',
        'Chirirbandar',
        'Fulbari',
        'Ghoraghat',
        'Hakimpur',
        'Kaharole',
        'Khansama',
        'Nawabganj',
        'Parbatipur',
    ],
    Gaibandha: [
        'Gaibandha Sadar',
        'Fulchhari',
        'Gobindaganj',
        'Palashbari',
        'Sadullapur',
        'Saghata',
        'Sundarganj',
    ],
    Kurigram: [
        'Kurigram Sadar',
        'Bhurungamari',
        'Char Rajibpur',
        'Chilmari',
        'Nageshwari',
        'Phulbari',
        'Rajarhat',
        'Rajibpur',
        'Rowmari',
        'Ulipur',
    ],
    Lalmonirhat: [
        'Lalmonirhat Sadar',
        'Aditmari',
        'Hatibandha',
        'Kaliganj',
        'Patgram',
    ],
    Nilphamari: [
        'Nilphamari Sadar',
        'Dimla',
        'Domar',
        'Jaldhaka',
        'Kishoreganj',
        'Saidpur',
    ],
    Panchagarh: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'],
    Thakurgaon: [
        'Thakurgaon Sadar',
        'Baliadangi',
        'Haripur',
        'Pirganj',
        'Ranisankail',
    ],
    // Mymensingh Division
    Mymensingh: [
        'Mymensingh Sadar',
        'Bhaluka',
        'Dhobaura',
        'Fulbaria',
        'Gaffargaon',
        'Gauripur',
        'Haluaghat',
        'Ishwarganj',
        'Muktagachha',
        'Nandail',
        'Phulpur',
        'Trishal',
    ],
    Jamalpur: [
        'Jamalpur Sadar',
        'Bakshiganj',
        'Dewanganj',
        'Islampur',
        'Madarganj',
        'Melandah',
        'Sarishabari',
    ],
    Sherpur: [
        'Sherpur Sadar',
        'Jhenaigati',
        'Nakla',
        'Nalitabari',
        'Sreebardi',
    ],
};

interface Variant {
    attributes: Record<string, string>;
    images: string[] | null;
}
interface CartItem {
    id: number;
    quantity: number;
    price: string;
    product: { name: string; images: string[] | null };
    variant: Variant | null;
}
interface Cart {
    items: CartItem[];
}
interface Props {
    cart: Cart;
}

type FormData = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    city: string;
    upazilla: string;
    village: string;
    zip: string;
    country: string;
    payment_method: string;
    coupon_code: string;
    transaction_id: string;
};

function Field({
    name,
    label,
    type = 'text',
    half = false,
    optional = false,
    autoComplete,
    data,
    setData,
    errors,
}: {
    name: keyof FormData;
    label: string;
    type?: string;
    half?: boolean;
    optional?: boolean;
    autoComplete?: string;
    data: FormData;
    setData: (key: keyof FormData, value: string) => void;
    errors: Partial<Record<keyof FormData, string>>;
}) {
    return (
        <div className={cn(half ? 'col-span-1' : 'col-span-2')}>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {optional && (
                    <span className="ml-1 text-xs font-normal text-gray-400">
                        (Optional)
                    </span>
                )}
            </label>
            <input
                type={type}
                value={data[name]}
                onChange={(e) => setData(name, e.target.value)}
                autoComplete={autoComplete}
                className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none',
                    errors[name] && 'border-red-400',
                )}
            />
            {errors[name] && (
                <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
            )}
        </div>
    );
}

export default function CheckoutPage({ cart }: Props) {
    const items = cart.items;
    const subtotal = items.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0,
    );

    const { data, setData, post, processing, errors } = useForm<FormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        city: '',
        upazilla: '',
        village: '',
        zip: '',
        country: 'Bangladesh',
        payment_method: 'cod',
        coupon_code: '',
        transaction_id: '',
    });

    function handleStateChange(state: string) {
        setData('state', state);
        setData('city', '');
        setData('upazilla', '');
        setData('village', '');
    }

    function handleCityChange(city: string) {
        setData('city', city);
        setData('upazilla', '');
        setData('village', '');
    }

    function handleUpazillaChange(upazilla: string) {
        setData('upazilla', upazilla);
        setData('village', '');
    }

    useEffect(() => {
        const parts = [
            data.village,
            data.upazilla,
            data.city,
            data.state,
            data.country,
        ].filter(Boolean);
        setData('address', parts.join(', '));
    }, [data.village, data.upazilla, data.city, data.state]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/orders');
    }

    const validDivision = !!BD_DIVISIONS[data.state];
    const validDistrict = !!BD_UPAZILLAS[data.city];

    const cities = validDivision ? BD_DIVISIONS[data.state] : [];
    const upazillas = validDistrict ? BD_UPAZILLAS[data.city] : [];

    const shipping = subtotal >= 2000 ? 0 : data.city === 'Dhaka' ? 80 : 130;

    return (
        <ShopLayout>
            <Head title="Checkout — CartAndBuy" />
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-2xl font-bold text-gray-900">
                    Checkout
                </h1>
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left — form */}
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-xl border border-gray-100 bg-white p-6">
                                <h2 className="mb-4 font-semibold text-gray-900">
                                    Shipping Address
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        name="first_name"
                                        label="First Name"
                                        half
                                        autoComplete="given-name"
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                    <Field
                                        name="last_name"
                                        label="Last Name"
                                        half
                                        optional
                                        autoComplete="family-name"
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                    <Field
                                        name="email"
                                        label="Email"
                                        type="email"
                                        optional
                                        autoComplete="email"
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                    <Field
                                        name="phone"
                                        label="Phone"
                                        autoComplete="tel"
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                    {/* Division */}
                                    <div className="col-span-1">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Division
                                        </label>
                                        <input
                                            list="divisions-list"
                                            value={data.state}
                                            onChange={(e) =>
                                                handleStateChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Type or select division"
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none',
                                                errors.state &&
                                                    'border-red-400',
                                            )}
                                        />
                                        <datalist id="divisions-list">
                                            {Object.keys(BD_DIVISIONS).map(
                                                (div) => (
                                                    <option
                                                        key={div}
                                                        value={div}
                                                    />
                                                ),
                                            )}
                                        </datalist>
                                        {errors.state && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    {/* District */}
                                    <div className="col-span-1">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            District
                                        </label>
                                        <input
                                            list="districts-list"
                                            value={data.city}
                                            onChange={(e) =>
                                                handleCityChange(e.target.value)
                                            }
                                            placeholder={
                                                validDivision
                                                    ? 'Type or select district'
                                                    : 'Select division first'
                                            }
                                            disabled={!validDivision}
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
                                                errors.city && 'border-red-400',
                                            )}
                                        />
                                        <datalist id="districts-list">
                                            {cities.map((city) => (
                                                <option
                                                    key={city}
                                                    value={city}
                                                />
                                            ))}
                                        </datalist>
                                        {errors.city && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    {/* Upazilla */}
                                    <div className="col-span-1">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Upazilla
                                        </label>
                                        <input
                                            list="upazillas-list"
                                            value={data.upazilla}
                                            onChange={(e) =>
                                                handleUpazillaChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                validDistrict
                                                    ? 'Type or select upazilla'
                                                    : 'Select district first'
                                            }
                                            disabled={!validDistrict}
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
                                                errors.upazilla &&
                                                    'border-red-400',
                                            )}
                                        />
                                        <datalist id="upazillas-list">
                                            {upazillas.map((u) => (
                                                <option key={u} value={u} />
                                            ))}
                                        </datalist>
                                        {errors.upazilla && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.upazilla}
                                            </p>
                                        )}
                                    </div>

                                    {/* Village */}
                                    <div className="col-span-1">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Village / Area
                                        </label>
                                        <input
                                            type="text"
                                            value={data.village}
                                            onChange={(e) =>
                                                setData(
                                                    'village',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                data.upazilla
                                                    ? 'e.g. Mirpur, Dhanmondi'
                                                    : 'Select upazilla first'
                                            }
                                            disabled={!data.upazilla}
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
                                                errors.village &&
                                                    'border-red-400',
                                            )}
                                        />
                                        {errors.village && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.village}
                                            </p>
                                        )}
                                    </div>

                                    {/* Address — auto-built, shown once village is filled */}
                                    {data.village && (
                                        <Field
                                            name="address"
                                            label="Address"
                                            autoComplete="street-address"
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                        />
                                    )}

                                    <Field
                                        name="zip"
                                        label="ZIP / Postal Code"
                                        half
                                        optional
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />

                                    <div className="col-span-1">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            value="Bangladesh"
                                            readOnly
                                            className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-white p-6">
                                <h2 className="mb-4 font-semibold text-gray-900">
                                    Payment Method
                                </h2>
                                <div className="mb-4 space-y-3">
                                    {(
                                        [
                                            {
                                                value: 'cod',
                                                label: 'Cash on Delivery',
                                                desc: 'Pay when your order arrives',
                                                icon: DollarSign,
                                                color: 'bg-gray-700',
                                            },
                                            {
                                                value: 'bkash',
                                                label: 'bKash',
                                                desc: 'Send to: 01616106838 (Personal)',
                                                icon: Smartphone,
                                                color: 'bg-[#e2136e]',
                                            },
                                            {
                                                value: 'nagad',
                                                label: 'Nagad',
                                                desc: 'Send to: 01794532606 (Personal)',
                                                icon: Smartphone,
                                                color: 'bg-[#f26522]',
                                            },
                                        ] as const
                                    ).map(
                                        ({
                                            value,
                                            label,
                                            desc,
                                            icon: Icon,
                                            color,
                                        }) => (
                                            <label
                                                key={value}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors',
                                                    data.payment_method ===
                                                        value
                                                        ? 'border-[#e94560] bg-[#e94560]/5'
                                                        : 'border-gray-200 hover:border-gray-300',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value={value}
                                                    checked={
                                                        data.payment_method ===
                                                        value
                                                    }
                                                    onChange={() => {
                                                        setData(
                                                            'payment_method',
                                                            value,
                                                        );
                                                        setData(
                                                            'transaction_id',
                                                            '',
                                                        );
                                                    }}
                                                    className="hidden"
                                                />
                                                <div
                                                    className={cn(
                                                        'rounded-lg p-2 text-white',
                                                        color,
                                                    )}
                                                >
                                                    <Icon className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {label}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {desc}
                                                    </div>
                                                </div>
                                            </label>
                                        ),
                                    )}
                                </div>

                                {data.payment_method === 'cod' &&
                                    shipping > 0 && (
                                        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                            Send delivery charge{' '}
                                            <span className="font-semibold">
                                                ৳{shipping}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-semibold">
                                                bKash: 01616106838
                                            </span>{' '}
                                            or{' '}
                                            <span className="font-semibold">
                                                Nagad: 01794532606
                                            </span>{' '}
                                            first, then enter your transaction
                                            ID below.
                                        </div>
                                    )}

                                {(data.payment_method === 'bkash' ||
                                    data.payment_method === 'nagad') && (
                                    <div
                                        className={cn(
                                            'mb-3 rounded-lg px-4 py-3 text-sm',
                                            data.payment_method === 'bkash'
                                                ? 'border border-pink-200 bg-pink-50 text-pink-800'
                                                : 'border border-orange-200 bg-orange-50 text-orange-800',
                                        )}
                                    >
                                        Send{' '}
                                        <span className="font-semibold">
                                            ৳{subtotal + shipping}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-semibold">
                                            {data.payment_method === 'bkash'
                                                ? 'bKash: 01616106838'
                                                : 'Nagad: 01794532606'}
                                        </span>{' '}
                                        (Personal), then enter your transaction
                                        ID below.
                                    </div>
                                )}

                                {(data.payment_method !== 'cod' ||
                                    shipping > 0) && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Transaction ID
                                            {data.payment_method === 'cod' && (
                                                <span className="ml-1 text-xs font-normal text-gray-400">
                                                    (delivery charge only)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.transaction_id}
                                            onChange={(e) =>
                                                setData(
                                                    'transaction_id',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 8N7A3B2X1Q"
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none',
                                                errors.transaction_id &&
                                                    'border-red-400',
                                            )}
                                        />
                                        {errors.transaction_id && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.transaction_id}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right — summary */}
                        <div>
                            <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-6">
                                <h2 className="mb-4 font-semibold text-gray-900">
                                    Order Summary
                                </h2>
                                <div className="mb-4 space-y-3">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-3"
                                        >
                                            <img
                                                src={
                                                    item.variant?.images?.[0] ??
                                                    item.product.images?.[0] ??
                                                    'https://placehold.co/48x48/e2e8f0/64748b?text=?'
                                                }
                                                alt=""
                                                className="h-12 w-12 rounded-lg bg-gray-50 object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-sm font-medium text-gray-900">
                                                    {item.product.name}
                                                </p>
                                                {item.variant && (
                                                    <p className="text-xs text-gray-400 capitalize">
                                                        {Object.entries(
                                                            item.variant
                                                                .attributes,
                                                        )
                                                            .map(
                                                                ([
                                                                    key,
                                                                    value,
                                                                ]) =>
                                                                    `${key}: ${value}`,
                                                            )
                                                            .join(' / ')}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                ৳
                                                {(
                                                    Number(item.price) *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2 border-t pt-4 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>৳{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>
                                            {shipping === 0 ? (
                                                <span className="text-green-600">
                                                    Free
                                                </span>
                                            ) : (
                                                `৳${shipping}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>
                                            ৳{(subtotal + shipping).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-4 w-full border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                                >
                                    {processing
                                        ? 'Placing Order…'
                                        : 'Place Order'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </ShopLayout>
    );
}
