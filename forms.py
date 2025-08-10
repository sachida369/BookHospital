from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, SelectField, TextAreaField, PasswordField, DecimalField
from wtforms.validators import DataRequired, Email, NumberRange, Length, Optional

class SearchForm(FlaskForm):
    """Search and filter form"""
    name = StringField('Hospital Name', validators=[Optional()])
    location = StringField('Location', validators=[Optional()])
    disease_type = SelectField('Disease Type', choices=[], validators=[Optional()])
    bed_type = SelectField('Bed Type', choices=[('', 'Any'), ('ICU', 'ICU'), ('General', 'General'), ('Private', 'Private')], validators=[Optional()])
    min_rating = DecimalField('Minimum Doctor Rating', validators=[Optional(), NumberRange(min=0, max=5)])
    max_fees = DecimalField('Maximum Consultation Fee', validators=[Optional(), NumberRange(min=0)])

class BookingForm(FlaskForm):
    """Bed booking form"""
    patient_name = StringField('Patient Name', validators=[DataRequired(), Length(min=2, max=100)])
    patient_age = IntegerField('Patient Age', validators=[DataRequired(), NumberRange(min=0, max=150)])
    patient_phone = StringField('Phone Number', validators=[DataRequired(), Length(min=10, max=15)])
    patient_email = StringField('Email', validators=[DataRequired(), Email()])
    bed_type = SelectField('Bed Type', choices=[
        ('ICU', 'ICU'),
        ('General', 'General Ward'),
        ('Private', 'Private Room')
    ], validators=[DataRequired()])
    disease_type = StringField('Disease/Condition', validators=[DataRequired(), Length(min=2, max=100)])
    emergency_contact = StringField('Emergency Contact', validators=[DataRequired(), Length(min=10, max=15)])
    special_requirements = TextAreaField('Special Requirements', validators=[Optional(), Length(max=500)])

class ContactForm(FlaskForm):
    """Contact form"""
    name = StringField('Your Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    subject = StringField('Subject', validators=[DataRequired(), Length(min=5, max=200)])
    message = TextAreaField('Message', validators=[DataRequired(), Length(min=10, max=1000)])

class AdminLoginForm(FlaskForm):
    """Admin login form"""
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=50)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6, max=100)])
