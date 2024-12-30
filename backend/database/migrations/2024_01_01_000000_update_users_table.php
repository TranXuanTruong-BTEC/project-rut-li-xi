<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('tiktok_id')->nullable()->unique();
            $table->string('avatar_url')->nullable();
            $table->string('access_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['tiktok_id', 'avatar_url', 'access_token', 'token_expires_at']);
        });
    }
}; 