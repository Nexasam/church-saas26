<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Church;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        $nigerianFirstNames = [
            'Samuel','John','Daniel','Emmanuel','Joshua','David','Michael','Joseph',
            'Peter','Paul','Matthew','Mark','Luke','James','Benjamin','Ezekiel','Isaiah',
            'Gabriel','Solomon','Elijah','Grace','Blessing','Esther','Ruth','Peace',
            'Deborah','Mercy','Tunde','Sola','Ayo','Kunle','Yemi','Bola','Funke','Damilola',
            'Ngozi','Chinelo','Chidera','Uche','Ifeanyi','Ada','Chika','Kemi','Aisha','Halima',
            'Femi','Bisi','Temi','Segun','Tosin','Chioma','Amaka','Nkechi','Ogechi','Ujunwa',
            'Chinonso','Obinna','Chukwuemeka','Olumide','Ayodele','Adesola','Oluwaseun','Modupe'
        ];
        
        $nigerianLastNames = [
            'Adebayo','Adeyemi','Olawale','Olatunji','Balogun','Ogunleye','Akinwale',
            'Akinyemi','Ogunbiyi','Adekunle','Okafor','Okoye','Eze','Onyekachi','Chukwu',
            'Ibrahim','Sadiq','Abdul','Mohammed','Musa','Lawal','Sule','Ahmed','Adedayo',
            'Adefemi','Ojo','Ogunleye','Fashola','Obasanjo','Ogunmola','Adewale','Ajayi',
            'Oluwafemi','Akanbi','Adebola','Olabisi','Ayodeji','Okonkwo','Nwankwo','Umeh',
            'Chukwudi','Iheanacho','Ezeani','Onyeka','Osagie','Omotayo','Olawumi','Olaniyi'
        ];
        

        $membershipTypes = ['full', 'visitor', 'youth', 'child'];

        // Ensure unique full name
        $firstName = $this->faker->randomElement($nigerianFirstNames);
        $lastName = $this->faker->randomElement($nigerianLastNames);

        return [
            // 'church_id' => Church::inRandomOrder()->first()->id ?? 1,

            'first_name' => $firstName,
            'last_name'  => $lastName,

            // Always have email & phone
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => '0' . $this->faker->unique()->numberBetween(7000000000, 9099999999),

            // 'membership_type' => $this->faker->randomElement($membershipTypes),
            'dob' => $this->faker->dateTimeBetween('-60 years', '-5 years'),
            'gender' => $this->faker->randomElement(['male', 'female']),

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
